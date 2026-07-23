"""
TalentIQ Resume Module — DRF Serializers
=========================================
Serializer hierarchy:
  - Individual serializers for each child model
  - ResumeSerializer: full nested read/write (used for create & update)
  - ResumeListSerializer: slim (for listing, no nested data)
  - ResumePublicSerializer: for public /resume/<id>/ endpoint (strips private fields)

Nested Write Pattern:
  ResumeSerializer.create() and update() iterate over each nested list,
  bulk-create child records, and cascade deletes on update.
"""

from rest_framework import serializers
from django.db import transaction

from .models import (
    Resume,
    PersonalInformation,
    Education,
    Skill,
    WorkExperience,
    Project,
    Certification,
    Achievement,
    Language,
    Interest,
    Reference,
    SkillGapAnalysis,
    JobMatchAnalysis,
    ResumeView,
    PortfolioProfile,
)


# ─────────────────────────────────────────────────────────────────────────────
# Child Model Serializers
# ─────────────────────────────────────────────────────────────────────────────

class PersonalInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalInformation
        exclude = ['resume']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        exclude = ['resume']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        exclude = ['resume']


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        exclude = ['resume']


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        exclude = ['resume']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        exclude = ['resume']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        exclude = ['resume']


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        exclude = ['resume']


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        exclude = ['resume']


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        exclude = ['resume']


class PortfolioProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProfile
        exclude = ['resume']
        read_only_fields = ['created_at', 'updated_at']


# ─────────────────────────────────────────────────────────────────────────────
# Intelligence / Analytics Serializers
# ─────────────────────────────────────────────────────────────────────────────


class SkillGapAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillGapAnalysis
        fields = '__all__'
        read_only_fields = ['resume', 'created_at']


class SkillGapAnalysisCreateSerializer(serializers.Serializer):
    """Request payload for POST /api/resume/skill-gap/"""
    resume_id = serializers.CharField(max_length=30)
    target_role = serializers.CharField(max_length=255, default='')
    current_skills = serializers.ListField(child=serializers.CharField(), default=list)
    missing_skills = serializers.ListField(child=serializers.CharField(), default=list)
    suggested_skills = serializers.ListField(child=serializers.CharField(), default=list)
    learning_path = serializers.ListField(child=serializers.DictField(), default=list)


class JobMatchAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobMatchAnalysis
        fields = '__all__'
        read_only_fields = ['resume', 'created_at']


class JobMatchAnalysisCreateSerializer(serializers.Serializer):
    """Request payload for POST /api/resume/job-match/"""
    resume_id = serializers.CharField(max_length=30)
    job_title = serializers.CharField(max_length=255)
    company_name = serializers.CharField(max_length=500, default='')
    job_description = serializers.CharField(default='')
    match_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    matched_skills = serializers.ListField(child=serializers.CharField(), default=list)
    missing_skills = serializers.ListField(child=serializers.CharField(), default=list)
    recommendations = serializers.ListField(child=serializers.CharField(), default=list)


class ResumeViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeView
        fields = ['id', 'viewed_at', 'visitor_type']
        read_only_fields = ['id', 'viewed_at']


# ─────────────────────────────────────────────────────────────────────────────
# Resume List Serializer (slim — for list views)
# ─────────────────────────────────────────────────────────────────────────────

class ResumeListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing resumes.
    Includes only top-level fields — no nested child data.
    """
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            'resume_id', 'title', 'profession',
            'full_name', 'created_at', 'updated_at',
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        try:
            return obj.personal_info.full_name
        except PersonalInformation.DoesNotExist:
            return ''


# ─────────────────────────────────────────────────────────────────────────────
# Resume Full Serializer (nested read/write)
# ─────────────────────────────────────────────────────────────────────────────

class ResumeSerializer(serializers.ModelSerializer):
    """
    Full nested serializer for creating and updating resumes.

    On CREATE:  All nested lists are bulk-created in a single transaction.
    On UPDATE:  Nested lists are replaced (delete + recreate strategy)
                to keep the logic simple and collision-free.
                Use PATCH + individual child endpoints for surgical edits.

    owner is set from request.user in the view — not accepted from client payload.
    """
    personal_info = PersonalInformationSerializer(required=False)
    educations = EducationSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    work_experiences = WorkExperienceSerializer(many=True, required=False)
    projects = ProjectSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    achievements = AchievementSerializer(many=True, required=False)
    languages = LanguageSerializer(many=True, required=False)
    interests = InterestSerializer(many=True, required=False)
    references = ReferenceSerializer(many=True, required=False)
    portfolio_profile = PortfolioProfileSerializer(required=False)

    # Read-only analytics (never written from client)

    class Meta:
        model = Resume
        fields = [
            # Master fields
            'resume_id', 'owner', 'title', 'profession',
            'professional_summary', 'career_objective',
            'template_name',
            'is_public', 'public_url',
            'view_count', 'pdf_download_count',
            'created_at', 'updated_at',
            # Nested children
            'personal_info',
            'educations',
            'skills',
            'work_experiences',
            'projects',
            'certifications',
            'achievements',
            'languages',
            'interests',
            'references',
            # Intelligence
            'portfolio_profile',
        ]
        read_only_fields = [
            'resume_id', 'owner',
            'view_count', 'pdf_download_count',
            'created_at', 'updated_at',
        ]

    @transaction.atomic
    def create(self, validated_data):
        """
        Create Resume + all nested children in a single atomic transaction.
        """
        personal_info_data = validated_data.pop('personal_info', None)
        educations_data = validated_data.pop('educations', [])
        skills_data = validated_data.pop('skills', [])
        work_experiences_data = validated_data.pop('work_experiences', [])
        projects_data = validated_data.pop('projects', [])
        certifications_data = validated_data.pop('certifications', [])
        achievements_data = validated_data.pop('achievements', [])
        languages_data = validated_data.pop('languages', [])
        interests_data = validated_data.pop('interests', [])
        references_data = validated_data.pop('references', [])
        portfolio_data = validated_data.pop('portfolio_profile', None)

        # Create master record
        resume = Resume.objects.create(**validated_data)

        # Set public_url now that we have the resume_id
        if not resume.public_url:
            resume.public_url = resume.get_public_url()
            resume.save(update_fields=['public_url'])

        # 1:1 — PersonalInformation
        if personal_info_data:
            PersonalInformation.objects.create(resume=resume, **personal_info_data)

        # 1:Many — bulk create for performance
        self._bulk_create(Education, resume, educations_data)
        self._bulk_create(Skill, resume, skills_data)
        self._bulk_create(WorkExperience, resume, work_experiences_data)
        self._bulk_create(Project, resume, projects_data)
        self._bulk_create(Certification, resume, certifications_data)
        self._bulk_create(Achievement, resume, achievements_data)
        self._bulk_create(Language, resume, languages_data)
        self._bulk_create(Interest, resume, interests_data)
        self._bulk_create(Reference, resume, references_data)

        # 1:1 — PortfolioProfile
        if portfolio_data:
            PortfolioProfile.objects.create(resume=resume, **portfolio_data)

        return resume

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        Update master Resume record + replace all nested children.
        Delete-then-recreate strategy is safe for this use case because
        each child's ID is not externally referenced.
        """
        personal_info_data = validated_data.pop('personal_info', None)
        educations_data = validated_data.pop('educations', None)
        skills_data = validated_data.pop('skills', None)
        work_experiences_data = validated_data.pop('work_experiences', None)
        projects_data = validated_data.pop('projects', None)
        certifications_data = validated_data.pop('certifications', None)
        achievements_data = validated_data.pop('achievements', None)
        languages_data = validated_data.pop('languages', None)
        interests_data = validated_data.pop('interests', None)
        references_data = validated_data.pop('references', None)
        portfolio_data = validated_data.pop('portfolio_profile', None)

        # Update scalar fields on the master record
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 1:1 — PersonalInformation (update or create)
        if personal_info_data is not None:
            PersonalInformation.objects.update_or_create(
                resume=instance,
                defaults=personal_info_data,
            )

        # 1:Many — replace strategy (only if the key was included in the payload)
        self._replace_children(Education, instance, educations_data)
        self._replace_children(Skill, instance, skills_data)
        self._replace_children(WorkExperience, instance, work_experiences_data)
        self._replace_children(Project, instance, projects_data)
        self._replace_children(Certification, instance, certifications_data)
        self._replace_children(Achievement, instance, achievements_data)
        self._replace_children(Language, instance, languages_data)
        self._replace_children(Interest, instance, interests_data)
        self._replace_children(Reference, instance, references_data)

        # 1:1 — PortfolioProfile
        if portfolio_data is not None:
            PortfolioProfile.objects.update_or_create(
                resume=instance,
                defaults=portfolio_data,
            )

        return instance

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _bulk_create(model_class, resume, data_list):
        """Bulk-create child records for a given model."""
        if not data_list:
            return
        model_class.objects.bulk_create([
            model_class(resume=resume, **item) for item in data_list
        ])

    @staticmethod
    def _replace_children(model_class, resume, data_list):
        """Delete existing + recreate if data_list was included in the payload."""
        if data_list is None:
            # Key was not sent — leave existing records untouched
            return
        # Delete existing
        model_class.objects.filter(resume=resume).delete()
        # Recreate
        if data_list:
            model_class.objects.bulk_create([
                model_class(resume=resume, **item) for item in data_list
            ])


# ─────────────────────────────────────────────────────────────────────────────
# Resume Public Serializer (unauthenticated /public/<resume_id>/ endpoint)
# ─────────────────────────────────────────────────────────────────────────────

class ResumePublicSerializer(serializers.ModelSerializer):
    """
    Public-safe view of a resume. Strips owner identity and internal counters.
    Returns all display sections needed to render the public resume page.
    """
    personal_info = PersonalInformationSerializer(read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    interests = InterestSerializer(many=True, read_only=True)
    references = ReferenceSerializer(many=True, read_only=True)
    portfolio_profile = PortfolioProfileSerializer(read_only=True)

    class Meta:
        model = Resume
        fields = [
            'resume_id', 'title', 'profession',
            'professional_summary', 'career_objective',
            'template_name',
            'view_count', 'created_at',
            # Nested display data
            'personal_info',
            'educations',
            'skills',
            'work_experiences',
            'projects',
            'certifications',
            'achievements',
            'languages',
            'interests',
            'references',
            'portfolio_profile',
        ]
        read_only_fields = fields