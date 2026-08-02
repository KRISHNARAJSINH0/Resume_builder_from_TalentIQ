"""
TalentIQ Resume Module — API Views
====================================
All endpoints use DRF APIView for explicit, readable URL→View mapping.

Authentication Strategy:
  - Public endpoints (ResumePublicView, TrackEventView): AllowAny
  - Owner endpoints (Detail, Update, Delete, List): IsAuthenticated or
    anonymous-safe (resume owned by request.user or no owner set).
  - Create/Analysis endpoints: AllowAny so guest users can generate resumes.

Endpoint Map:
  POST   /api/resume/create/                 → ResumeCreateView
  GET    /api/resume/list/                   → ResumeListView
  GET    /api/resume/<resume_id>/            → ResumeDetailView
  PUT    /api/resume/update/<resume_id>/     → ResumeUpdateView
  DELETE /api/resume/delete/<resume_id>/     → ResumeDeleteView
  GET    /api/resume/public/<resume_id>/     → ResumePublicView
  POST   /api/resume/ats-analysis/           → ATSAnalysisView
  POST   /api/resume/job-match/              → JobMatchView
  POST   /api/resume/skill-gap/             → SkillGapView
  POST   /api/resume/track/<resume_id>/     → TrackEventView
"""

import os
import logging
import PyPDF2

from django.conf import settings
from django.db import transaction
from django.db.models import F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from .models import (
    Resume,
    SkillGapAnalysis,
    JobMatchAnalysis,
    ResumeView,
)
from .serializers import (
    ResumeSerializer,
    ResumeListSerializer,
    ResumePublicSerializer,
    SkillGapAnalysisSerializer,
    SkillGapAnalysisCreateSerializer,
    JobMatchAnalysisSerializer,
    JobMatchAnalysisCreateSerializer,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_resume_or_404(resume_id):
    """Fetch Resume by resume_id or raise DoesNotExist."""
    try:
        return Resume.objects.get(resume_id=resume_id)
    except Resume.DoesNotExist:
        return None


def _get_client_ip(request):
    """Extract real client IP from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


def _record_view_event(resume, visitor_type, request):
    """
    Log a ResumeView event and atomically increment the denormalized counter.
    Uses F() expression to prevent race conditions on concurrent requests.
    """
    ResumeView.objects.create(
        resume=resume,
        visitor_type=visitor_type,
        visitor_ip=_get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
    )
    Resume.objects.filter(pk=resume.pk).update(view_count=F('view_count') + 1)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Resume Create  —  POST /api/resume/create/
# ─────────────────────────────────────────────────────────────────────────────

class ResumeCreateView(APIView):
    """
    Create a new resume with all nested sections in one atomic request.

    Authentication: Optional — if user is authenticated, resume is linked to
    their account. Anonymous users can still create public resumes.
    """
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Strip owner from payload — set from authenticated user only
        data.pop('owner', None)
        data.pop('resume_id', None)

        serializer = ResumeSerializer(data=data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Inject the authenticated user as owner (if logged in)
        owner = request.user if request.user.is_authenticated else None
        resume = serializer.save(owner=owner)

        return Response(
            {
                'resume_id': resume.resume_id,
                'public_url': resume.public_url or resume.get_public_url(),
                'created_at': resume.created_at.isoformat(),
                'data': ResumeSerializer(resume).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 2. Resume List  —  GET /api/resume/list/
# ─────────────────────────────────────────────────────────────────────────────

class ResumeListView(APIView):
    """
    List all resumes owned by the authenticated user.
    Returns slim serializer (no nested data) for performance.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        resumes = Resume.objects.filter(owner=request.user).order_by('-created_at')
        serializer = ResumeListSerializer(resumes, many=True)
        return Response({'count': resumes.count(), 'results': serializer.data})


# ─────────────────────────────────────────────────────────────────────────────
# 3. Resume Detail  —  GET /api/resume/<resume_id>/
# ─────────────────────────────────────────────────────────────────────────────

class ResumeDetailView(APIView):
    """
    Retrieve full resume data for the authenticated owner.
    Returns complete nested data including all child models.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, resume_id):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Ownership check — allow if no owner (legacy anonymous) or matching user
        if resume.owner is not None and resume.owner != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ResumeSerializer(resume)
        return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Resume Update  —  PUT /api/resume/update/<resume_id>/
# ─────────────────────────────────────────────────────────────────────────────

class ResumeUpdateView(APIView):
    """
    Update a resume. Accepts full or partial payload.
    - Scalar fields: updated in place.
    - Nested list fields (educations, skills, etc.): replaced if included.
      To leave a section untouched, omit its key from the request body.

    Use PUT for full replacement, PATCH for partial updates.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def put(self, request, resume_id):
        return self._update(request, resume_id, partial=False)

    def patch(self, request, resume_id):
        return self._update(request, resume_id, partial=True)

    def _update(self, request, resume_id, partial):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        if resume.owner is not None and resume.owner != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data.pop('owner', None)
        data.pop('resume_id', None)

        serializer = ResumeSerializer(resume, data=data, partial=partial)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated_resume = serializer.save()
        return Response(ResumeSerializer(updated_resume).data)


# ─────────────────────────────────────────────────────────────────────────────
# 5. Resume Delete  —  DELETE /api/resume/delete/<resume_id>/
# ─────────────────────────────────────────────────────────────────────────────

class ResumeDeleteView(APIView):
    """
    Permanently delete a resume and all related data (CASCADE on FK).
    Also removes the QR code image file from disk.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, resume_id):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        if resume.owner is not None and resume.owner != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)


        resume.delete()  # CASCADE deletes all child records
        return Response({'message': f'Resume {resume_id} deleted successfully.'}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# 6. Public Resume  —  GET /api/resume/public/<resume_id>/
# ─────────────────────────────────────────────────────────────────────────────

class ResumePublicView(APIView):
    """
    Public endpoint — no authentication required.
    Returns structured resume data for the /resume/<resume_id>/ page.
    Tracks view event unless ?no_track=1 is passed (dev/preview mode).

    visitor_type is 'qr' if ?via=qr is passed (from QR code scan),
    otherwise 'direct'.
    """
    permission_classes = [AllowAny]

    def get(self, request, resume_id):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not resume.is_public:
            return Response({'error': 'This resume is not publicly accessible.'}, status=status.HTTP_403_FORBIDDEN)

        # Determine visitor type
        via = request.query_params.get('via', 'direct')
        visitor_type = ResumeView.VisitorType.QR if via == 'qr' else ResumeView.VisitorType.DIRECT

        # Track view event (skip in dev/preview mode)
        no_track = request.query_params.get('no_track', '0') == '1'
        if not no_track:
            _record_view_event(resume, visitor_type, request)

        serializer = ResumePublicSerializer(resume)
        data = serializer.data
        data['view_count'] = resume.view_count
        data['pdf_downloads'] = getattr(resume, 'pdf_download_count', 0)
        data['qr_scans'] = ResumeView.objects.filter(
            resume=resume, visitor_type=ResumeView.VisitorType.QR
        ).count()
        return Response(data)




# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# 8. Job Match  —  POST /api/resume/job-match/
# ─────────────────────────────────────────────────────────────────────────────

class JobMatchView(APIView):
    """
    Store job-resume match analysis results.

    Request body:
    {
        "resume_id": "TIQ-xxx",
        "job_title": "Senior Python Developer",
        "company_name": "Google",
        "job_description": "...",
        "match_score": 82.0,
        "matched_skills": ["Python", "Django"],
        "missing_skills": ["Kubernetes"],
        "recommendations": ["Add Kubernetes experience"]
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = JobMatchAnalysisCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        resume = _get_resume_or_404(data.pop('resume_id'))
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        job_match = JobMatchAnalysis.objects.create(resume=resume, **data)
        return Response(
            JobMatchAnalysisSerializer(job_match).data,
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, resume_id=None):
        """GET /api/resume/job-match/?resume_id=TIQ-xxx"""
        rid = resume_id or request.query_params.get('resume_id')
        if not rid:
            return Response({'error': 'resume_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        resume = _get_resume_or_404(rid)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        analyses = JobMatchAnalysis.objects.filter(resume=resume)
        return Response(JobMatchAnalysisSerializer(analyses, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# 9. Skill Gap  —  POST /api/resume/skill-gap/
# ─────────────────────────────────────────────────────────────────────────────

class SkillGapView(APIView):
    """
    Store skill gap analysis results for a resume/target-role pair.

    Request body:
    {
        "resume_id": "TIQ-xxx",
        "target_role": "Machine Learning Engineer",
        "current_skills": ["Python", "Pandas"],
        "missing_skills": ["TensorFlow", "MLflow"],
        "suggested_skills": ["PyTorch", "Kubeflow"],
        "learning_path": [{"title": "...", "url": "...", "duration": "..."}]
    }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SkillGapAnalysisCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        resume = _get_resume_or_404(data.pop('resume_id'))
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        gap = SkillGapAnalysis.objects.create(resume=resume, **data)
        return Response(
            SkillGapAnalysisSerializer(gap).data,
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, resume_id=None):
        """GET /api/resume/skill-gap/?resume_id=TIQ-xxx"""
        rid = resume_id or request.query_params.get('resume_id')
        if not rid:
            return Response({'error': 'resume_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        resume = _get_resume_or_404(rid)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        analyses = SkillGapAnalysis.objects.filter(resume=resume)
        return Response(SkillGapAnalysisSerializer(analyses, many=True).data)


# ─────────────────────────────────────────────────────────────────────────────
# 10. Track Event  —  POST /api/resume/track/<resume_id>/
# ─────────────────────────────────────────────────────────────────────────────

class TrackEventView(APIView):
    """
    Track analytics events for a public resume.
    No authentication required — called by the public resume page.

    Valid events:
      'view'         — page view (also logs a ResumeView row)
      'pdf_download' — PDF was downloaded

    Request body:
    { "event": "view" | "pdf_download" }
    """
    permission_classes = [AllowAny]

    VALID_EVENTS = {
        'view': 'view_count',
        'pdf_download': 'pdf_download_count',
    }

    def post(self, request, resume_id):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        event = request.data.get('event', '')
        counter_field = self.VALID_EVENTS.get(event)
        if not counter_field:
            return Response(
                {'error': f'Unknown event "{event}". Valid: {list(self.VALID_EVENTS)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Atomic increment via F() — prevents race conditions
            Resume.objects.filter(pk=resume.pk).update(**{counter_field: F(counter_field) + 1})

            # Log view event row
            if event == 'view':
                ResumeView.objects.create(
                    resume=resume,
                    visitor_type=ResumeView.VisitorType.DIRECT,
                    visitor_ip=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                )

        return Response({'status': 'tracked', 'event': event, 'resume_id': resume_id})


# ─────────────────────────────────────────────────────────────────────────────
# Health check (kept for compatibility)
# ─────────────────────────────────────────────────────────────────────────────
# 11. Certificate Upload  —  POST /api/resume/upload-certificate/
# ─────────────────────────────────────────────────────────────────────────────

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid

class CertificateUploadView(APIView):
    """
    Upload a real certificate file (image/PDF) to media/certificates/.
    Returns a fully qualified HTTP URL to the file.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a unique path under media/certificates/
        ext = os.path.splitext(file_obj.name)[1].lower()
        unique_name = f"{uuid.uuid4().hex}{ext}"
        
        path = default_storage.save(f"certificates/{unique_name}", ContentFile(file_obj.read()))
        
        # Build the full URL (handling local LAN IP vs localhost dynamically)
        domain = request.build_absolute_uri('/')[:-1]
        file_url = f"{domain}{settings.MEDIA_URL}{path}"

        # Extract text content if it's a PDF
        extracted_text = ""
        if ext == '.pdf':
            try:
                file_abs_path = os.path.join(settings.MEDIA_ROOT, path)
                with open(file_abs_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted_text += page.extract_text() or ""
            except Exception as e:
                logger.warning('Could not extract text from PDF %s: %s', file_obj.name, e)

        # Fallback to cleaned filename as hint
        if not extracted_text.strip():
            base_name = os.path.splitext(file_obj.name)[0]
            cleaned_name = base_name.replace('_', ' ').replace('-', ' ')
            extracted_text = f"Certificate Name: {cleaned_name}"

        return Response({
            'url': file_url,
            'filename': file_obj.name,
            'extracted_text': extracted_text.strip(),
        }, status=status.HTTP_201_CREATED)


from django.http import HttpResponse
from .pdf_generator import generate_resume_pdf

class ResumeDownloadPDFView(APIView):
    """
    Generate a text-based, searchable, and machine-readable PDF
    using ReportLab and return it as a response.
    """
    permission_classes = [AllowAny]

    def get(self, request, resume_id):
        resume = _get_resume_or_404(resume_id)
        if resume is None:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            pdf_bytes = generate_resume_pdf(resume)
            
            # Formulate safe filename from personal_info or default
            name = "Resume"
            if getattr(resume, 'personal_info', None) and resume.personal_info.full_name:
                name = resume.personal_info.full_name.strip()
            filename = f"{name}.pdf"
            
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            logger.exception("Failed to generate PDF for resume %s: %s", resume_id, str(e))
            return Response({'error': f'Failed to generate PDF: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResumeHealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'status': 'ok', 'app': 'resume', 'version': '2.0'})