"""
TalentIQ Resume Module — Migration 0002: Normalized Schema
===========================================================
This migration:
  1. Drops the legacy flat `resume_publicresume` table.
  2. Creates 17 new normalized tables for the complete resume module.

All changes are wrapped in a single migration so they apply atomically.
Generated from models.py — do not edit manually unless you know what you are doing.
Run with: python manage.py migrate apps.resume 0002
"""

# pyrefly: ignore [missing-import]
import apps.resume.models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # Depends on the first migration which created PublicResume
        ('resume', '0001_initial'),
        # We FK to the auth user model
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        # ── Step 1: Drop the legacy flat PublicResume table ───────────────────
        migrations.DeleteModel(
            name='PublicResume',
        ),

        # ── Step 2: Create Resume (master record) ────────────────────────────
        migrations.CreateModel(
            name='Resume',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('resume_id', models.CharField(
                    db_index=True,
                    default=apps.resume.models.generate_resume_id,
                    help_text='Public-facing ID used in share URLs (e.g. TIQ-1782743215079).',
                    max_length=30,
                    unique=True,
                )),
                ('title', models.CharField(blank=True, default='', max_length=255,
                    help_text="Display title for this resume version.")),
                ('profession', models.CharField(blank=True, default='', max_length=255)),
                ('professional_summary', models.TextField(blank=True, default='')),
                ('career_objective', models.TextField(blank=True, default='')),
                ('template_name', models.CharField(blank=True, default='classic', max_length=100)),
                ('ats_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('is_public', models.BooleanField(default=True)),
                ('public_url', models.CharField(blank=True, default='', max_length=500)),
                ('qr_url', models.CharField(blank=True, default='', max_length=500)),
                ('view_count', models.PositiveIntegerField(default=0)),
                ('qr_scan_count', models.PositiveIntegerField(default=0)),
                ('pdf_download_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='resumes',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Resume',
                'verbose_name_plural': 'Resumes',
                'ordering': ['-created_at'],
            },
        ),

        # ── Indexes on Resume ────────────────────────────────────────────────
        migrations.AddIndex(
            model_name='resume',
            index=models.Index(fields=['owner', '-created_at'], name='resume_owner_created_idx'),
        ),
        migrations.AddIndex(
            model_name='resume',
            index=models.Index(fields=['is_public', 'resume_id'], name='resume_public_id_idx'),
        ),

        # ── Step 3: PersonalInformation ───────────────────────────────────────
        migrations.CreateModel(
            name='PersonalInformation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(blank=True, default='', max_length=255)),
                ('phone', models.CharField(blank=True, default='', max_length=30)),
                ('email', models.EmailField(blank=True, default='', max_length=254)),
                ('address', models.CharField(blank=True, default='', max_length=500)),
                ('linkedin_url', models.URLField(blank=True, default='', max_length=500)),
                ('portfolio_url', models.URLField(blank=True, default='', max_length=500)),
                ('github_url', models.URLField(blank=True, default='', max_length=500)),
                ('profile_photo', models.ImageField(blank=True, null=True, upload_to='profile_photos/')),
                ('resume', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='personal_info',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Personal Information',
                'verbose_name_plural': 'Personal Information',
            },
        ),

        # ── Step 4: Education ─────────────────────────────────────────────────
        migrations.CreateModel(
            name='Education',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('degree', models.CharField(max_length=255)),
                ('institution', models.CharField(max_length=500)),
                ('specialization', models.CharField(blank=True, default='', max_length=255)),
                ('start_year', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('end_year', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('percentage_or_cgpa', models.CharField(blank=True, default='', max_length=20)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='educations',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Education',
                'verbose_name_plural': 'Educations',
                'ordering': ['order', '-end_year'],
            },
        ),

        # ── Step 5: Skill ────────────────────────────────────────────────────
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('skill_name', models.CharField(max_length=150)),
                ('skill_category', models.CharField(
                    choices=[
                        ('Technical', 'Technical'),
                        ('Soft Skill', 'Soft Skill'),
                        ('Language', 'Language'),
                        ('Tool', 'Tool'),
                        ('Framework', 'Framework'),
                        ('Database', 'Database'),
                        ('Other', 'Other'),
                    ],
                    default='Technical',
                    max_length=50,
                )),
                ('proficiency_level', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='skills',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Skill',
                'verbose_name_plural': 'Skills',
                'ordering': ['skill_category', 'order', 'skill_name'],
            },
        ),
        migrations.AddIndex(
            model_name='skill',
            index=models.Index(fields=['resume', 'skill_category'], name='skill_resume_cat_idx'),
        ),
        migrations.AddIndex(
            model_name='skill',
            index=models.Index(fields=['skill_name'], name='skill_name_idx'),
        ),

        # ── Step 6: WorkExperience ───────────────────────────────────────────
        migrations.CreateModel(
            name='WorkExperience',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company', models.CharField(max_length=500)),
                ('role', models.CharField(max_length=255)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('is_current', models.BooleanField(default=False)),
                ('description', models.TextField(blank=True, default='')),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='work_experiences',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Work Experience',
                'verbose_name_plural': 'Work Experiences',
                'ordering': ['order', '-start_date'],
            },
        ),

        # ── Step 7: Project ──────────────────────────────────────────────────
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('technologies', models.CharField(blank=True, default='', max_length=500)),
                ('github_link', models.URLField(blank=True, default='', max_length=500)),
                ('live_link', models.URLField(blank=True, default='', max_length=500)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='projects',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Project',
                'verbose_name_plural': 'Projects',
                'ordering': ['order', 'project_name'],
            },
        ),

        # ── Step 8: Certification ────────────────────────────────────────────
        migrations.CreateModel(
            name='Certification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('certification_name', models.CharField(max_length=255)),
                ('issuer', models.CharField(blank=True, default='', max_length=255)),
                ('issue_date', models.DateField(blank=True, null=True)),
                ('expiry_date', models.DateField(blank=True, null=True)),
                ('credential_url', models.URLField(blank=True, default='', max_length=500)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='certifications',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Certification',
                'verbose_name_plural': 'Certifications',
                'ordering': ['order', '-issue_date'],
            },
        ),

        # ── Step 9: Achievement ──────────────────────────────────────────────
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('achievement_title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, default='')),
                ('achievement_date', models.DateField(blank=True, null=True)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='achievements',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Achievement',
                'verbose_name_plural': 'Achievements',
                'ordering': ['order', '-achievement_date'],
            },
        ),

        # ── Step 10: Language ────────────────────────────────────────────────
        migrations.CreateModel(
            name='Language',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_name', models.CharField(max_length=100)),
                ('proficiency', models.CharField(
                    choices=[
                        ('Native', 'Native'),
                        ('Fluent', 'Fluent'),
                        ('Professional', 'Professional Working Proficiency'),
                        ('Intermediate', 'Intermediate'),
                        ('Basic', 'Basic'),
                    ],
                    default='Fluent',
                    max_length=20,
                )),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='languages',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Language',
                'verbose_name_plural': 'Languages',
                'ordering': ['order', 'language_name'],
            },
        ),

        # ── Step 11: Interest ────────────────────────────────────────────────
        migrations.CreateModel(
            name='Interest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('interest_name', models.CharField(max_length=150)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='interests',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Interest',
                'verbose_name_plural': 'Interests',
                'ordering': ['order', 'interest_name'],
            },
        ),

        # ── Step 12: Reference ───────────────────────────────────────────────
        migrations.CreateModel(
            name='Reference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference_name', models.CharField(max_length=255)),
                ('designation', models.CharField(blank=True, default='', max_length=255)),
                ('organization', models.CharField(blank=True, default='', max_length=500)),
                ('contact_details', models.CharField(blank=True, default='', max_length=500)),
                ('order', models.PositiveSmallIntegerField(default=0)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='references',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Reference',
                'verbose_name_plural': 'References',
                'ordering': ['order', 'reference_name'],
            },
        ),

        # ── Step 13: ATSAnalysis ─────────────────────────────────────────────
        migrations.CreateModel(
            name='ATSAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ats_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('strengths', models.JSONField(default=list)),
                ('weaknesses', models.JSONField(default=list)),
                ('missing_keywords', models.JSONField(default=list)),
                ('recommendations', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resume', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ats_analysis',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'ATS Analysis',
                'verbose_name_plural': 'ATS Analyses',
            },
        ),

        # ── Step 14: SkillGapAnalysis ────────────────────────────────────────
        migrations.CreateModel(
            name='SkillGapAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('target_role', models.CharField(blank=True, default='', max_length=255)),
                ('current_skills', models.JSONField(default=list)),
                ('missing_skills', models.JSONField(default=list)),
                ('suggested_skills', models.JSONField(default=list)),
                ('learning_path', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='skill_gap_analyses',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Skill Gap Analysis',
                'verbose_name_plural': 'Skill Gap Analyses',
                'ordering': ['-created_at'],
            },
        ),

        # ── Step 15: JobMatchAnalysis ────────────────────────────────────────
        migrations.CreateModel(
            name='JobMatchAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('job_title', models.CharField(max_length=255)),
                ('company_name', models.CharField(blank=True, default='', max_length=500)),
                ('job_description', models.TextField(blank=True, default='')),
                ('match_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('matched_skills', models.JSONField(default=list)),
                ('missing_skills', models.JSONField(default=list)),
                ('recommendations', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='job_match_analyses',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Job Match Analysis',
                'verbose_name_plural': 'Job Match Analyses',
                'ordering': ['-created_at'],
            },
        ),

        # ── Step 16: QRAnalytics ─────────────────────────────────────────────
        migrations.CreateModel(
            name='QRAnalytics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scan_count', models.PositiveIntegerField(default=0)),
                ('last_scanned_at', models.DateTimeField(blank=True, null=True)),
                ('qr_image_path', models.CharField(blank=True, default='', max_length=500)),
                ('resume', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='qr_analytics',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'QR Analytics',
                'verbose_name_plural': 'QR Analytics',
            },
        ),

        # ── Step 17: ResumeView ──────────────────────────────────────────────
        migrations.CreateModel(
            name='ResumeView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('viewed_at', models.DateTimeField(auto_now_add=True)),
                ('visitor_type', models.CharField(
                    choices=[
                        ('direct', 'Direct Visit'),
                        ('qr', 'QR Code Scan'),
                        ('recruiter', 'Recruiter'),
                        ('embed', 'Embedded Widget'),
                        ('unknown', 'Unknown'),
                    ],
                    default='unknown',
                    max_length=20,
                )),
                ('visitor_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.CharField(blank=True, default='', max_length=500)),
                ('resume', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='views',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Resume View',
                'verbose_name_plural': 'Resume Views',
                'ordering': ['-viewed_at'],
            },
        ),
        migrations.AddIndex(
            model_name='resumeview',
            index=models.Index(fields=['resume', '-viewed_at'], name='resumeview_resume_at_idx'),
        ),
        migrations.AddIndex(
            model_name='resumeview',
            index=models.Index(fields=['visitor_type'], name='resumeview_type_idx'),
        ),

        # ── Step 18: PortfolioProfile ─────────────────────────────────────────
        migrations.CreateModel(
            name='PortfolioProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('about_me', models.TextField(blank=True, default='')),
                ('featured_projects', models.JSONField(default=list)),
                ('social_links', models.JSONField(default=dict)),
                ('profile_theme', models.CharField(
                    choices=[
                        ('light', 'Light'),
                        ('dark', 'Dark'),
                        ('professional', 'Professional Blue'),
                        ('creative', 'Creative Purple'),
                        ('minimal', 'Minimal White'),
                    ],
                    default='professional',
                    max_length=20,
                )),
                ('is_published', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resume', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='portfolio_profile',
                    to='resume.resume',
                )),
            ],
            options={
                'verbose_name': 'Portfolio Profile',
                'verbose_name_plural': 'Portfolio Profiles',
            },
        ),
    ]
