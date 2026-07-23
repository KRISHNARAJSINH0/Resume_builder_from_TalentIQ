import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT

def generate_resume_pdf(resume):
    """
    Generates a true text-based PDF using ReportLab.
    Returns a bytes object containing the PDF data.
    """
    buffer = io.BytesIO()
    
    # Page setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles matching TalentIQ color scheme (indigo/violet primary)
    primary_color = colors.HexColor("#7B6FFF") # Violet primary
    dark_neutral = colors.HexColor("#1A1A1A")    # Title & main headings
    body_color = colors.HexColor("#333333")      # Dark gray for body
    muted_color = colors.HexColor("#666666")     # Light gray for meta
    
    # Create distinct styles
    style_name = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_neutral,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    
    style_contact = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=body_color,
        alignment=TA_CENTER,
        spaceAfter=10
    )
    
    style_h1 = ParagraphStyle(
        'ResumeH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=4,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=4
    )
    
    style_body_bold = ParagraphStyle(
        'ResumeBodyBold',
        parent=style_body,
        fontName='Helvetica-Bold'
    )
    
    style_meta = ParagraphStyle(
        'ResumeMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=muted_color
    )
    
    story = []
    
    # Fetch nested info
    personal_info = getattr(resume, 'personal_info', None)
    educations = resume.educations.all().order_by('order', '-end_year')
    skills = resume.skills.all().order_by('order', 'skill_name')
    work_experiences = resume.work_experiences.all().order_by('order', '-start_date')
    projects = resume.projects.all().order_by('order', 'project_name')
    certifications = resume.certifications.all().order_by('order', '-issue_date')
    achievements = resume.achievements.all().order_by('order', '-achievement_date')
    
    # ── HEADER (Name & Professional Title) ───────────────────
    name = personal_info.full_name if personal_info else (resume.owner.get_full_name() if (resume.owner and resume.owner.get_full_name()) else "Candidate Name")
    story.append(Paragraph(name, style_name))
    
    if resume.profession:
        profession_style = ParagraphStyle(
            'ResumeTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=primary_color,
            alignment=TA_CENTER,
            spaceAfter=4
        )
        story.append(Paragraph(resume.profession.upper(), profession_style))
    
    # ── CONTACT DETAILS ──────────────────────────────────────
    contact_parts = []
    if personal_info:
        if personal_info.email:
            contact_parts.append(personal_info.email)
        if personal_info.phone:
            contact_parts.append(personal_info.phone)
        if personal_info.address:
            contact_parts.append(personal_info.address)
        if personal_info.linkedin_url:
            # Clean URL to display
            display_li = personal_info.linkedin_url.replace("https://", "").replace("www.", "")
            contact_parts.append(f'<a href="{personal_info.linkedin_url}" color="#7B6FFF">{display_li}</a>')
        if personal_info.github_url:
            display_gh = personal_info.github_url.replace("https://", "").replace("www.", "")
            contact_parts.append(f'<a href="{personal_info.github_url}" color="#7B6FFF">{display_gh}</a>')
        if personal_info.portfolio_url:
            display_pf = personal_info.portfolio_url.replace("https://", "").replace("www.", "")
            contact_parts.append(f'<a href="{personal_info.portfolio_url}" color="#7B6FFF">{display_pf}</a>')
            
    contact_str = "  |  ".join(contact_parts)
    story.append(Paragraph(contact_str, style_contact))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E0E0E0"), spaceAfter=10))
    
    # ── PROFESSIONAL SUMMARY ─────────────────────────────────
    summary_text = resume.professional_summary or resume.career_objective
    if summary_text:
        story.append(Paragraph("PROFESSIONAL SUMMARY", style_h1))
        story.append(Paragraph(summary_text, style_body))
        story.append(Spacer(1, 6))
        
    # ── SKILLS ───────────────────────────────────────────────
    if skills.exists():
        story.append(Paragraph("SKILLS", style_h1))
        # Group skills by category
        cat_skills = {}
        for s in skills:
            cat = s.get_skill_category_display() or "Technical"
            cat_skills.setdefault(cat, []).append(s.skill_name)
            
        skills_elements = []
        for cat, names in cat_skills.items():
            skills_str = f"<b>{cat}:</b> " + ", ".join(names)
            skills_elements.append(Paragraph(skills_str, style_body))
            
        for el in skills_elements:
            story.append(el)
        story.append(Spacer(1, 6))
        
    # ── WORK EXPERIENCE ──────────────────────────────────────
    if work_experiences.exists():
        story.append(Paragraph("WORK EXPERIENCE", style_h1))
        for exp in work_experiences:
            # Layout Header (Role & Company, Date)
            date_str = f"{exp.start_date.strftime('%b %Y') if exp.start_date else ''} - "
            if exp.is_current or not exp.end_date:
                date_str += "Present"
            else:
                date_str += exp.end_date.strftime('%b %Y')
                
            col_1 = Paragraph(f"<b>{exp.role}</b> — {exp.company}", style_body)
            col_2 = Paragraph(date_str, ParagraphStyle('RightMeta', parent=style_meta, alignment=TA_RIGHT))
            
            # Use table to push dates to the right edge
            t = Table([[col_1, col_2]], colWidths=[380, 140])
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            
            exp_flowables = [t]
            
            # Job Description bullet points
            if exp.description:
                bullets = exp.description.split("\n")
                for bullet in bullets:
                    b_text = bullet.strip()
                    if not b_text:
                        continue
                    if b_text.startswith("•") or b_text.startswith("-"):
                        b_text = b_text[1:].strip()
                    exp_flowables.append(Paragraph(f"• {b_text}", ParagraphStyle('BulletText', parent=style_body, leftIndent=12, firstLineIndent=-12)))
                    
            story.append(KeepTogether(exp_flowables))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # ── EDUCATION ────────────────────────────────────────────
    if educations.exists():
        story.append(Paragraph("EDUCATION", style_h1))
        for edu in educations:
            # Layout Header (Degree & Specialization, Institution, Year)
            degree_str = edu.degree
            if edu.specialization:
                degree_str += f" in {edu.specialization}"
                
            col_1 = Paragraph(f"<b>{degree_str}</b> — {edu.institution}", style_body)
            
            date_str = f"{edu.start_year} - {edu.end_year or 'Present'}" if edu.start_year else (str(edu.end_year) if edu.end_year else "")
            if edu.percentage_or_cgpa:
                date_str = f"{edu.percentage_or_cgpa} | {date_str}" if date_str else edu.percentage_or_cgpa
                
            col_2 = Paragraph(date_str, ParagraphStyle('RightMetaEdu', parent=style_meta, alignment=TA_RIGHT))
            
            t = Table([[col_1, col_2]], colWidths=[380, 140])
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            story.append(KeepTogether([t]))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))
        
    # ── PROJECTS ─────────────────────────────────────────────
    if projects.exists():
        story.append(Paragraph("PROJECTS", style_h1))
        for proj in projects:
            title_text = f"<b>{proj.project_name}</b>"
            if proj.technologies:
                title_text += f" (<i>{proj.technologies}</i>)"
                
            links = []
            if proj.github_link:
                links.append(f'<a href="{proj.github_link}" color="#7B6FFF">GitHub</a>')
            if proj.live_link:
                links.append(f'<a href="{proj.live_link}" color="#7B6FFF">Live Demo</a>')
            links_str = " | ".join(links)
            
            col_1 = Paragraph(title_text, style_body)
            col_2 = Paragraph(links_str, ParagraphStyle('RightLinks', parent=style_meta, alignment=TA_RIGHT))
            
            t = Table([[col_1, col_2]], colWidths=[380, 140])
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            
            proj_flowables = [t]
            if proj.description:
                proj_flowables.append(Paragraph(proj.description, style_body))
                
            story.append(KeepTogether(proj_flowables))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))
        
    # ── CERTIFICATIONS ───────────────────────────────────────
    if certifications.exists():
        story.append(Paragraph("CERTIFICATIONS", style_h1))
        for cert in certifications:
            cert_text = f"<b>{cert.certification_name}</b>"
            if cert.issuer:
                cert_text += f" — {cert.issuer}"
            if cert.issue_date:
                cert_text += f" ({cert.issue_date.strftime('%Y')})"
                
            story.append(Paragraph(f"• {cert_text}", ParagraphStyle('CertBullet', parent=style_body, leftIndent=12, firstLineIndent=-12)))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 4))

    # ── ACHIEVEMENTS ─────────────────────────────────────────
    if achievements.exists():
        story.append(Paragraph("ACHIEVEMENTS", style_h1))
        for ach in achievements:
            title_text = f"<b>{ach.achievement_title}</b>"
            col_1 = Paragraph(title_text, style_body)
            date_str = ach.achievement_date.strftime('%b %Y') if ach.achievement_date else ""
            col_2 = Paragraph(date_str, ParagraphStyle('RightAch', parent=style_meta, alignment=TA_RIGHT))
            
            t = Table([[col_1, col_2]], colWidths=[380, 140])
            t.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('TOPPADDING', (0,0), (-1,-1), 2),
            ]))
            
            ach_flowables = [t]
            if ach.description:
                ach_flowables.append(Paragraph(ach.description, style_body))
            story.append(KeepTogether(ach_flowables))
            story.append(Spacer(1, 4))
            
    # Build Document
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
