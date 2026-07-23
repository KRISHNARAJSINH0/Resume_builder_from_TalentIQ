"""
TalentIQ Resume Module — Normalized Database Models
====================================================
Architecture: 16 normalized models replacing the legacy flat JSONField approach.
Compatible with SQLite (current) and PostgreSQL (future migration target).

Model Hierarchy:
    Resume (master record)
    ├── PersonalInformation  [1:1]
    ├── Education            [1:Many]
    ├── Skill                [1:Many]
    ├── WorkExperience       [1:Many]
    ├── Project              [1:Many]
    ├── Certification        [1:Many]
    ├── Achievement          [1:Many]
    ├── Language             [1:Many]
    ├── Interest             [1:Many]
    ├── Reference            [1:Many]
    ├── ATSAnalysis          [1:1]
    ├── SkillGapAnalysis     [1:Many]
    ├── JobMatchAnalysis     [1:Many]
    ├── ResumeView           [1:Many - event log]
    └── PortfolioProfile     [1:1]
"""

import time
import random
import string

from django.conf import settings
from django.db import models


# ─────────────────────────────────────────────────────────────────────────────
# ID Generator
# ─────────────────────────────────────────────────────────────────────────────

def generate_resume_id():
    """
    Generate a unique TalentIQ resume ID.
    Format: TIQ-<13-digit timestamp><3 random digits>
    Example: TIQ-1782743215079428

    Using timestamp + random suffix makes collisions astronomically unlikely
    without needing a DB round-trip, while remaining URL-safe and readable.
    """
    ts = str(int(time.time() * 1000))          # 13-digit millisecond timestamp
    suffix = ''.join(random.choices(string.digits, k=3))
    return f'TIQ-{ts}{suffix}'


# ─────────────────────────────────────────────────────────────────────────────
# 1. Resume  (Master Record)
# ─────────────────────────────────────────────────────────────────────────────

class Resume(models.Model):
    """
    Central master record for a resume. All other models FK to this.

    owner: nullable so anonymous/unauthenticated users can still generate
           resumes. Set owner when the user is logged in.
    resume_id: public-facing URL-safe identifier (TIQ-xxx).
    is_public: controls whether the /resume/<resume_id>/ page is accessible.
    """

    # ── Identity ──────────────────────────────────────────────────────────────
    resume_id = models.CharField(
        max_length=30,
        unique=True,
        default=generate_resume_id,
        db_index=True,
        help_text="Public-facing ID used in share URLs (e.g. TIQ-1782743215079).",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resumes',
        help_text="Authenticated user who owns this resume. NULL for anonymous.",
    )

    # ── Meta ──────────────────────────────────────────────────────────────────
    title = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Display title for this resume version (e.g. 'Software Engineer - Google').",
    )
    profession = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Target job role / profession (e.g. 'Full Stack Developer').",
    )
    professional_summary = models.TextField(
        blank=True,
        default='',
        help_text="2–4 sentence professional summary paragraph.",
    )
    career_objective = models.TextField(
        blank=True,
        default='',
        help_text="Career objective statement (often used for freshers).",
    )
    template_name = models.CharField(
        max_length=100,
        blank=True,
        default='classic',
        help_text="Frontend template key used to render this resume.",
    )


    is_public = models.BooleanField(
        default=True,
        help_text="If True, the public /resume/<resume_id>/ page is accessible.",
    )
    public_url = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Fully-qualified public URL (set on create).",
    )

    # ── Analytics Counters (denormalized for performance) ─────────────────────
    view_count = models.PositiveIntegerField(default=0)
    pdf_download_count = models.PositiveIntegerField(default=0)

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'
        indexes = [
            models.Index(fields=['owner', '-created_at']),
            models.Index(fields=['is_public', 'resume_id']),
        ]

    def __str__(self):
        return f'{self.resume_id} — {self.profession or "No Profession"}'

    def get_public_url(self, base_url='https://talentiq.com'):
        return f'{base_url}/resume/{self.resume_id}'


# ─────────────────────────────────────────────────────────────────────────────
# 2. Personal Information  [1:1 with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class PersonalInformation(models.Model):
    """
    Contact and social details for the resume owner.
    1:1 with Resume — every resume has exactly one personal info record.
    """
    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='personal_info',
    )
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.CharField(max_length=500, blank=True, default='')
    linkedin_url = models.URLField(max_length=500, blank=True, default='')
    portfolio_url = models.URLField(max_length=500, blank=True, default='')
    github_url = models.URLField(max_length=500, blank=True, default='')
    profile_photo = models.ImageField(
        upload_to='profile_photos/',
        null=True,
        blank=True,
        help_text="Stored in MEDIA_ROOT/profile_photos/. Never serve base64 blobs.",
    )

    class Meta:
        verbose_name = 'Personal Information'
        verbose_name_plural = 'Personal Information'

    def __str__(self):
        return f'{self.full_name} ({self.resume.resume_id})'


# ─────────────────────────────────────────────────────────────────────────────
# 3. Education  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Education(models.Model):
    """
    Academic qualifications. Multiple records per resume (B.Tech + MBA etc.).
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='educations',
    )
    degree = models.CharField(
        max_length=255,
        help_text="e.g. 'Bachelor of Technology', 'MBA'",
    )
    institution = models.CharField(
        max_length=500,
        help_text="University / college / school name.",
    )
    specialization = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="e.g. 'Computer Science & Engineering'",
    )
    start_year = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="4-digit year (e.g. 2019).",
    )
    end_year = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="4-digit year or NULL if currently studying.",
    )
    percentage_or_cgpa = models.CharField(
        max_length=20,
        blank=True,
        default='',
        help_text="e.g. '8.5 CGPA' or '85%'. Stored as string to accommodate both.",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Display order (0 = most recent first).",
    )

    class Meta:
        ordering = ['order', '-end_year']
        verbose_name = 'Education'
        verbose_name_plural = 'Educations'

    def __str__(self):
        return f'{self.degree} — {self.institution}'


# ─────────────────────────────────────────────────────────────────────────────
# 4. Skill  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Skill(models.Model):
    """
    Individual skills attached to a resume.
    Normalized into rows so we can query: "all resumes with Python skill".
    """

    class Category(models.TextChoices):
        TECHNICAL = 'Technical', 'Technical'
        SOFT_SKILL = 'Soft Skill', 'Soft Skill'
        LANGUAGE = 'Language', 'Language'
        TOOL = 'Tool', 'Tool'
        FRAMEWORK = 'Framework', 'Framework'
        DATABASE = 'Database', 'Database'
        OTHER = 'Other', 'Other'

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='skills',
    )
    skill_name = models.CharField(max_length=150)
    skill_category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.TECHNICAL,
    )
    proficiency_level = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="Optional 1–5 proficiency rating. NULL means unrated.",
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['skill_category', 'order', 'skill_name']
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        indexes = [
            models.Index(fields=['resume', 'skill_category']),
            # Enables: "find all resumes that mention Python"
            models.Index(fields=['skill_name']),
        ]

    def __str__(self):
        return f'{self.skill_name} [{self.skill_category}]'


# ─────────────────────────────────────────────────────────────────────────────
# 5. Work Experience  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class WorkExperience(models.Model):
    """
    Professional work history. Multiple records per resume.
    end_date=NULL means "current position".
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='work_experiences',
    )
    company = models.CharField(max_length=500)
    role = models.CharField(max_length=255, help_text="Job title / role.")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(
        null=True, blank=True,
        help_text="NULL = currently working here.",
    )
    is_current = models.BooleanField(default=False)
    description = models.TextField(
        blank=True,
        default='',
        help_text="Bullet-point responsibilities and achievements.",
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-start_date']
        verbose_name = 'Work Experience'
        verbose_name_plural = 'Work Experiences'

    def __str__(self):
        return f'{self.role} @ {self.company}'


# ─────────────────────────────────────────────────────────────────────────────
# 6. Project  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Project(models.Model):
    """
    Projects (personal, academic, or professional). Multiple per resume.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    project_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    technologies = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Comma-separated list: 'React, Django, PostgreSQL'.",
    )
    github_link = models.URLField(max_length=500, blank=True, default='')
    live_link = models.URLField(max_length=500, blank=True, default='')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'project_name']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return self.project_name


# ─────────────────────────────────────────────────────────────────────────────
# 7. Certification  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Certification(models.Model):
    """
    Professional certifications and credentials.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='certifications',
    )
    certification_name = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255, blank=True, default='')
    issue_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(
        null=True, blank=True,
        help_text="NULL = does not expire.",
    )
    credential_url = models.URLField(max_length=500, blank=True, default='')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-issue_date']
        verbose_name = 'Certification'
        verbose_name_plural = 'Certifications'

    def __str__(self):
        return f'{self.certification_name} — {self.issuer}'


# ─────────────────────────────────────────────────────────────────────────────
# 8. Achievement  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Achievement(models.Model):
    """
    Awards, honours, and notable achievements.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    achievement_title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    achievement_date = models.DateField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', '-achievement_date']
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'

    def __str__(self):
        return self.achievement_title


# ─────────────────────────────────────────────────────────────────────────────
# 9. Language  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Language(models.Model):
    """
    Spoken / written language proficiencies (separate from skill languages).
    """

    class Proficiency(models.TextChoices):
        NATIVE = 'Native', 'Native'
        FLUENT = 'Fluent', 'Fluent'
        PROFESSIONAL = 'Professional', 'Professional Working Proficiency'
        INTERMEDIATE = 'Intermediate', 'Intermediate'
        BASIC = 'Basic', 'Basic'

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='languages',
    )
    language_name = models.CharField(max_length=100)
    proficiency = models.CharField(
        max_length=20,
        choices=Proficiency.choices,
        default=Proficiency.FLUENT,
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'language_name']
        verbose_name = 'Language'
        verbose_name_plural = 'Languages'

    def __str__(self):
        return f'{self.language_name} ({self.proficiency})'


# ─────────────────────────────────────────────────────────────────────────────
# 10. Interest  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Interest(models.Model):
    """
    Personal hobbies and interests.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='interests',
    )
    interest_name = models.CharField(max_length=150)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'interest_name']
        verbose_name = 'Interest'
        verbose_name_plural = 'Interests'

    def __str__(self):
        return self.interest_name


# ─────────────────────────────────────────────────────────────────────────────
# 11. Reference  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class Reference(models.Model):
    """
    Professional references.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='references',
    )
    reference_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, default='')
    organization = models.CharField(max_length=500, blank=True, default='')
    contact_details = models.CharField(
        max_length=500,
        blank=True,
        default='',
        help_text="Email, phone, or LinkedIn URL.",
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'reference_name']
        verbose_name = 'Reference'
        verbose_name_plural = 'References'

    def __str__(self):
        return f'{self.reference_name} — {self.organization}'




# ─────────────────────────────────────────────────────────────────────────────
# 13. Skill Gap Analysis  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class SkillGapAnalysis(models.Model):
    """
    Skill gap analysis for a specific target role.
    1:Many because a user can run multiple analyses for different job targets.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='skill_gap_analyses',
    )
    target_role = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="The job role this analysis is targeting.",
    )
    current_skills = models.JSONField(
        default=list,
        help_text="Skills the candidate currently has (from resume).",
    )
    missing_skills = models.JSONField(
        default=list,
        help_text="Skills required for the target role but absent in resume.",
    )
    suggested_skills = models.JSONField(
        default=list,
        help_text="Additional skills that would strengthen the profile.",
    )
    learning_path = models.JSONField(
        default=list,
        help_text="Ordered list of learning resources / courses.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Skill Gap Analysis'
        verbose_name_plural = 'Skill Gap Analyses'

    def __str__(self):
        return f'Gap Analysis — {self.resume.resume_id} → {self.target_role}'


# ─────────────────────────────────────────────────────────────────────────────
# 14. Job Match Analysis  [1:Many with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class JobMatchAnalysis(models.Model):
    """
    Match analysis between this resume and a specific job posting.
    1:Many — a candidate can match against multiple job descriptions.
    """
    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='job_match_analyses',
    )
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=500, blank=True, default='')
    job_description = models.TextField(
        blank=True,
        default='',
        help_text="Raw JD text used for matching. Not shown in public view.",
    )
    match_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="0.00–100.00 compatibility score.",
    )
    matched_skills = models.JSONField(
        default=list,
        help_text="Skills present in both the resume and JD.",
    )
    missing_skills = models.JSONField(
        default=list,
        help_text="Skills in JD but not in resume.",
    )
    recommendations = models.JSONField(
        default=list,
        help_text="Actionable improvement suggestions.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job Match Analysis'
        verbose_name_plural = 'Job Match Analyses'

    def __str__(self):
        return f'Job Match — {self.job_title} @ {self.company_name} ({self.match_score}%)'


# ─────────────────────────────────────────────────────────────────────────────
# 15. Resume View  [1:Many with Resume — event log]
# ─────────────────────────────────────────────────────────────────────────────

class ResumeView(models.Model):
    """
    Immutable event log of resume page views.
    Each row = one visit. Aggregate queries give you analytics.

    visitor_type:
        'direct'   — user navigated to URL directly
        'recruiter'— recruiter explicitly tagged (future: via auth header)
        'embed'    — viewed via embedded widget
    """

    class VisitorType(models.TextChoices):
        DIRECT = 'direct', 'Direct Visit'
        RECRUITER = 'recruiter', 'Recruiter'
        EMBED = 'embed', 'Embedded Widget'
        UNKNOWN = 'unknown', 'Unknown'

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name='views',
    )
    viewed_at = models.DateTimeField(auto_now_add=True)
    visitor_type = models.CharField(
        max_length=20,
        choices=VisitorType.choices,
        default=VisitorType.UNKNOWN,
    )
    visitor_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Hashed/anonymized in production for GDPR compliance.",
    )
    user_agent = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['-viewed_at']
        verbose_name = 'Resume View'
        verbose_name_plural = 'Resume Views'
        indexes = [
            models.Index(fields=['resume', '-viewed_at']),
            models.Index(fields=['visitor_type']),
        ]

    def __str__(self):
        return f'View [{self.visitor_type}] — {self.resume.resume_id} @ {self.viewed_at}'


# ─────────────────────────────────────────────────────────────────────────────
# 17. Portfolio Profile  [1:1 with Resume]
# ─────────────────────────────────────────────────────────────────────────────

class PortfolioProfile(models.Model):
    """
    Extended public portfolio page data linked to a resume.
    about_me, featured_projects (IDs), social_links, and theme settings.

    featured_projects: JSON array of Project PKs to highlight.
    social_links: JSON dict { "twitter": "...", "dribbble": "..." } — flexible
                  for various platform additions without schema changes.
    """

    class ProfileTheme(models.TextChoices):
        LIGHT = 'light', 'Light'
        DARK = 'dark', 'Dark'
        PROFESSIONAL = 'professional', 'Professional Blue'
        CREATIVE = 'creative', 'Creative Purple'
        MINIMAL = 'minimal', 'Minimal White'

    resume = models.OneToOneField(
        Resume,
        on_delete=models.CASCADE,
        related_name='portfolio_profile',
    )
    about_me = models.TextField(
        blank=True,
        default='',
        help_text="Extended bio / about me section for portfolio page.",
    )
    featured_projects = models.JSONField(
        default=list,
        help_text="List of Project PKs to feature on the portfolio page.",
    )
    social_links = models.JSONField(
        default=dict,
        help_text="Dict of platform → URL: {'twitter': '...', 'dribbble': '...'}",
    )
    profile_theme = models.CharField(
        max_length=20,
        choices=ProfileTheme.choices,
        default=ProfileTheme.PROFESSIONAL,
    )
    is_published = models.BooleanField(
        default=False,
        help_text="If True, portfolio page is publicly accessible.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Portfolio Profile'
        verbose_name_plural = 'Portfolio Profiles'

    def __str__(self):
        return f'Portfolio — {self.resume.resume_id}'