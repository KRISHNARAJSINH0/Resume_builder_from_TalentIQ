"""
TalentIQ Resume Module — Django Admin Registration
===================================================
Full admin registration for all 17 resume models.
- Inline admins for every 1:Many child model.
- Search, filter, and fieldset grouping for usability.
- Read-only auto-generated fields (IDs, timestamps, counters).
"""

from django.contrib import admin
from django.utils.html import format_html

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
# Inline Admins (children of Resume)
# ─────────────────────────────────────────────────────────────────────────────

class PersonalInformationInline(admin.StackedInline):
    model = PersonalInformation
    extra = 0
    max_num = 1
    can_delete = False
    fields = [
        'full_name', 'phone', 'email', 'address',
        'linkedin_url', 'portfolio_url', 'github_url', 'profile_photo',
    ]


class EducationInline(admin.TabularInline):
    model = Education
    extra = 1
    fields = ['degree', 'institution', 'specialization', 'start_year', 'end_year', 'percentage_or_cgpa', 'order']
    ordering = ['order']


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 3
    fields = ['skill_name', 'skill_category', 'proficiency_level', 'order']
    ordering = ['skill_category', 'order']


class WorkExperienceInline(admin.StackedInline):
    model = WorkExperience
    extra = 1
    fields = ['company', 'role', 'start_date', 'end_date', 'is_current', 'description', 'order']
    ordering = ['order']


class ProjectInline(admin.TabularInline):
    model = Project
    extra = 1
    fields = ['project_name', 'technologies', 'github_link', 'live_link', 'order']
    ordering = ['order']


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 1
    fields = ['certification_name', 'issuer', 'issue_date', 'credential_url', 'order']
    ordering = ['order']


class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 1
    fields = ['achievement_title', 'achievement_date', 'description', 'order']
    ordering = ['order']


class LanguageInline(admin.TabularInline):
    model = Language
    extra = 1
    fields = ['language_name', 'proficiency', 'order']
    ordering = ['order']


class InterestInline(admin.TabularInline):
    model = Interest
    extra = 2
    fields = ['interest_name', 'order']
    ordering = ['order']


class ReferenceInline(admin.TabularInline):
    model = Reference
    extra = 1
    fields = ['reference_name', 'designation', 'organization', 'contact_details', 'order']
    ordering = ['order']



class PortfolioProfileInline(admin.StackedInline):
    model = PortfolioProfile
    extra = 0
    max_num = 1
    can_delete = False
    readonly_fields = ['created_at', 'updated_at']
    fields = ['about_me', 'featured_projects', 'social_links', 'profile_theme', 'is_published', 'created_at', 'updated_at']


# ─────────────────────────────────────────────────────────────────────────────
# Resume (Master Admin)
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = [
        'resume_id', 'get_full_name', 'profession',
        'is_public', 'view_count', 'owner', 'created_at',
    ]
    list_filter = ['is_public', 'template_name', 'created_at']
    search_fields = ['resume_id', 'profession', 'title', 'owner__username', 'owner__email']
    readonly_fields = [
        'resume_id', 'view_count', 'pdf_download_count',
        'created_at', 'updated_at', 'public_url_display',
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

    inlines = [
        PersonalInformationInline,
        EducationInline,
        SkillInline,
        WorkExperienceInline,
        ProjectInline,
        CertificationInline,
        AchievementInline,
        LanguageInline,
        InterestInline,
        ReferenceInline,
        PortfolioProfileInline,
    ]

    fieldsets = (
        ('🆔 Identity', {
            'fields': ('resume_id', 'owner', 'title', 'profession', 'template_name'),
        }),
        ('📝 Content', {
            'fields': ('professional_summary', 'career_objective'),
            'classes': ('collapse',),
        }),
        ('🌐 Sharing', {
            'fields': ('is_public', 'public_url'),
        }),
        ('📈 Analytics (read-only)', {
            'fields': ('view_count', 'pdf_download_count'),
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @admin.display(description='Full Name')
    def get_full_name(self, obj):
        try:
            return obj.personal_info.full_name
        except PersonalInformation.DoesNotExist:
            return '—'

    @admin.display(description='Public URL')
    def public_url_display(self, obj):
        url = obj.get_public_url()
        return format_html('<a href="{}" target="_blank">{}</a>', url, url)


# ─────────────────────────────────────────────────────────────────────────────
# Stand-alone Model Admins
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(PersonalInformation)
class PersonalInformationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'resume']
    search_fields = ['full_name', 'email', 'phone', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['degree', 'institution', 'specialization', 'start_year', 'end_year', 'resume']
    list_filter = ['start_year', 'end_year']
    search_fields = ['degree', 'institution', 'specialization', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['skill_name', 'skill_category', 'proficiency_level', 'resume']
    list_filter = ['skill_category']
    search_fields = ['skill_name', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ['role', 'company', 'start_date', 'end_date', 'is_current', 'resume']
    list_filter = ['is_current', 'start_date']
    search_fields = ['role', 'company', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'technologies', 'resume']
    search_fields = ['project_name', 'technologies', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['certification_name', 'issuer', 'issue_date', 'resume']
    list_filter = ['issue_date']
    search_fields = ['certification_name', 'issuer', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['achievement_title', 'achievement_date', 'resume']
    list_filter = ['achievement_date']
    search_fields = ['achievement_title', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['language_name', 'proficiency', 'resume']
    list_filter = ['proficiency']
    search_fields = ['language_name', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ['interest_name', 'resume']
    search_fields = ['interest_name', 'resume__resume_id']
    raw_id_fields = ['resume']


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ['reference_name', 'designation', 'organization', 'resume']
    search_fields = ['reference_name', 'organization', 'resume__resume_id']
    raw_id_fields = ['resume']



@admin.register(SkillGapAnalysis)
class SkillGapAnalysisAdmin(admin.ModelAdmin):
    list_display = ['resume', 'target_role', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    search_fields = ['resume__resume_id', 'target_role']
    raw_id_fields = ['resume']


@admin.register(JobMatchAnalysis)
class JobMatchAnalysisAdmin(admin.ModelAdmin):
    list_display = ['resume', 'job_title', 'company_name', 'match_score', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
    search_fields = ['resume__resume_id', 'job_title', 'company_name']
    raw_id_fields = ['resume']



@admin.register(ResumeView)
class ResumeViewAdmin(admin.ModelAdmin):
    list_display = ['resume', 'visitor_type', 'viewed_at', 'visitor_ip']
    list_filter = ['visitor_type', 'viewed_at']
    readonly_fields = ['viewed_at']
    search_fields = ['resume__resume_id', 'visitor_ip']
    raw_id_fields = ['resume']
    date_hierarchy = 'viewed_at'

    def has_add_permission(self, request):
        """View events are created programmatically — not via admin."""
        return False

    def has_change_permission(self, request, obj=None):
        """Immutable event log — no edits allowed via admin."""
        return False


@admin.register(PortfolioProfile)
class PortfolioProfileAdmin(admin.ModelAdmin):
    list_display = ['resume', 'profile_theme', 'is_published', 'created_at']
    list_filter = ['profile_theme', 'is_published']
    readonly_fields = ['created_at', 'updated_at']
    search_fields = ['resume__resume_id']
    raw_id_fields = ['resume']