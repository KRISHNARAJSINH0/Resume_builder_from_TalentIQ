"""
TalentIQ Resume Module — URL Configuration
============================================
All routes are prefixed with /api/resume/ in the root urls.py.

Full endpoint table:
  POST   /api/resume/create/               ResumeCreateView
  GET    /api/resume/list/                 ResumeListView
  GET    /api/resume/<resume_id>/          ResumeDetailView
  PUT    /api/resume/update/<resume_id>/   ResumeUpdateView
  PATCH  /api/resume/update/<resume_id>/   ResumeUpdateView (partial)
  DELETE /api/resume/delete/<resume_id>/   ResumeDeleteView
  GET    /api/resume/public/<resume_id>/   ResumePublicView
  POST   /api/resume/ats-analysis/         ATSAnalysisView
  POST   /api/resume/job-match/            JobMatchView
  GET    /api/resume/job-match/            JobMatchView (list by resume_id param)
  POST   /api/resume/skill-gap/            SkillGapView
  GET    /api/resume/skill-gap/            SkillGapView (list by resume_id param)
  POST   /api/resume/track/<resume_id>/    TrackEventView
  GET    /api/resume/                      ResumeHealthView
"""

from django.urls import path
from .views import (
    ResumeHealthView,
    ResumeCreateView,
    ResumeListView,
    ResumeDetailView,
    ResumeUpdateView,
    ResumeDeleteView,
    ResumePublicView,
    JobMatchView,
    SkillGapView,
    TrackEventView,
    CertificateUploadView,
    ResumeDownloadPDFView,
)
from .groq_proxy import groq_proxy

urlpatterns = [
    # ── Health check ──────────────────────────────────────────────────────────
    path('', ResumeHealthView.as_view(), name='resume-health'),
    path('health/', ResumeHealthView.as_view(), name='resume-health-ping'),

    # ── Groq AI Proxy (keeps API key server-side) ─────────────────────────────
    path('groq-proxy/', groq_proxy, name='groq-proxy'),

    # ── Download PDF (ReportLab text-based PDF) ────────────────────────────────
    path('download-pdf/<str:resume_id>/', ResumeDownloadPDFView.as_view(), name='resume-download-pdf'),

    # ── CRUD ─────────────────────────────────────────────────────────────────
    # POST: create a new resume with all nested sections
    path('create/', ResumeCreateView.as_view(), name='resume-create'),

    # GET: list all resumes for authenticated user (slim serializer)
    path('list/', ResumeListView.as_view(), name='resume-list'),

    # PUT/PATCH: update resume (authenticated owner)
    path('update/<str:resume_id>/', ResumeUpdateView.as_view(), name='resume-update'),

    # DELETE: delete resume + all children (authenticated owner)
    path('delete/<str:resume_id>/', ResumeDeleteView.as_view(), name='resume-delete'),

    # ── Public ────────────────────────────────────────────────────────────────
    # GET: public resume page — no auth required
    # ?no_track=1 skips analytics (dev preview)
    path('public/<str:resume_id>/', ResumePublicView.as_view(), name='resume-public'),

    # ── Intelligence Endpoints ────────────────────────────────────────────────

    # POST: store job match analysis; GET: list for a resume
    path('job-match/', JobMatchView.as_view(), name='resume-job-match'),

    # POST: store skill gap analysis; GET: list for a resume
    path('skill-gap/', SkillGapView.as_view(), name='resume-skill-gap'),

    # ── Analytics Tracking ───────────────────────────────────────────────────
    # POST: track view / pdf_download event
    path('track/<str:resume_id>/', TrackEventView.as_view(), name='resume-track'),

    # ── File Uploads ─────────────────────────────────────────────────────────
    # POST: upload certificate file
    path('upload-certificate/', CertificateUploadView.as_view(), name='resume-upload-certificate'),

    # GET: full resume detail (authenticated owner) - Moved to bottom to prevent matching static paths
    path('<str:resume_id>/', ResumeDetailView.as_view(), name='resume-detail'),
]