import { useState, useCallback } from 'react';
import { getBackendUrl } from '../utils/apiConfig';
import { saveResumeLocally } from '../api/resumePublicAPI';
import {
  generateInterviewQuestions,
  enhanceSummary,
  enhanceExperience,
  enhanceProjects,
  analyzeSkillGap,
  analyzeJobMatch,
  generateInterviewPrep,
  generatePortfolio,
} from '../api/resumeAPI';

// ─────────────────────────────────────────────────────────────────
// PROFESSIONS LIST
// ─────────────────────────────────────────────────────────────────
export const PROFESSIONS = [
  { id: 'software_engineer', label: 'Software Engineer', icon: '💻', category: 'Tech' },
  { id: 'fullstack_dev', label: 'Full Stack Developer', icon: '🌐', category: 'Tech' },
  { id: 'data_analyst', label: 'Data Analyst', icon: '📊', category: 'Tech' },
  { id: 'ai_ml_engineer', label: 'AI/ML Engineer', icon: '🤖', category: 'Tech' },
  { id: 'ui_ux_designer', label: 'UI/UX Designer', icon: '🎨', category: 'Design' },
  { id: 'graphic_designer', label: 'Graphic Designer', icon: '✏️', category: 'Design' },
  { id: 'mechanical_engineer', label: 'Mechanical Engineer', icon: '⚙️', category: 'Engineering' },
  { id: 'civil_engineer', label: 'Civil Engineer', icon: '🏗️', category: 'Engineering' },
  { id: 'electrical_engineer', label: 'Electrical Engineer', icon: '⚡', category: 'Engineering' },
  { id: 'chemical_engineer', label: 'Chemical Engineer', icon: '🧪', category: 'Engineering' },
  { id: 'doctor', label: 'Doctor', icon: '🩺', category: 'Healthcare' },
  { id: 'nurse', label: 'Nurse', icon: '💊', category: 'Healthcare' },
  { id: 'pharmacist', label: 'Pharmacist', icon: '🏥', category: 'Healthcare' },
  { id: 'teacher', label: 'Teacher', icon: '📚', category: 'Education' },
  { id: 'professor', label: 'Professor', icon: '🎓', category: 'Education' },
  { id: 'accountant', label: 'Accountant', icon: '🧾', category: 'Finance' },
  { id: 'chartered_accountant', label: 'Chartered Accountant (CA)', icon: '📋', category: 'Finance' },
  { id: 'hr_executive', label: 'HR Executive', icon: '🤝', category: 'Management' },
  { id: 'marketing_executive', label: 'Marketing Executive', icon: '📢', category: 'Management' },
  { id: 'sales_executive', label: 'Sales Executive', icon: '💼', category: 'Management' },
  { id: 'business_analyst', label: 'Business Analyst', icon: '📈', category: 'Management' },
  { id: 'project_manager', label: 'Project Manager', icon: '🗂️', category: 'Management' },
  { id: 'police_officer', label: 'Police Officer', icon: '🚔', category: 'Public Service' },
  { id: 'lawyer', label: 'Lawyer', icon: '⚖️', category: 'Public Service' },
  { id: 'architect', label: 'Architect', icon: '🏛️', category: 'Creative' },
  { id: 'interior_designer', label: 'Interior Designer', icon: '🛋️', category: 'Creative' },
  { id: 'hotel_manager', label: 'Hotel Manager', icon: '🏨', category: 'Hospitality' },
  { id: 'chef', label: 'Chef', icon: '👨‍🍳', category: 'Hospitality' },
  { id: 'event_manager', label: 'Event Manager', icon: '🎪', category: 'Hospitality' },
  { id: 'digital_marketer', label: 'Digital Marketer', icon: '📱', category: 'Media' },
  { id: 'content_writer', label: 'Content Writer', icon: '✍️', category: 'Media' },
  { id: 'journalist', label: 'Journalist', icon: '📰', category: 'Media' },
  { id: 'photographer', label: 'Photographer', icon: '📷', category: 'Media' },
  { id: 'video_editor', label: 'Video Editor', icon: '🎬', category: 'Media' },
  { id: 'animator', label: 'Animator', icon: '🎭', category: 'Media' },
  { id: 'fashion_designer', label: 'Fashion Designer', icon: '👗', category: 'Creative' },
  { id: 'student_fresher', label: 'Student/Fresher', icon: '🎓', category: 'Entry Level' },
  { id: 'freelancer', label: 'Freelancer', icon: '🌍', category: 'Entry Level' },
];

// ─────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  phase: 'profession_select', // profession_select | interview | generating | results
  profession: null,
  questions: [],        // [{id, question, placeholder, required}]
  currentQIndex: 0,
  answers: {},          // {questionId: answerString}
  chatHistory: [],      // [{role:'ai'|'user', text:''}]
  interviewGroup: 'personal', // personal | professional
  resumeData: null,
  gapData: null,
  interviewPrepData: null,
  portfolioData: null,
  activeTab: 0,
  loading: false,
  generatingStep: '',
  error: null,
  jobMatchData: null,
  jobMatchLoading: false,
};

// ─────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────
export default function useResumeBuilder() {
  const [state, setState] = useState(INITIAL_STATE);

  const update = (patch) => setState((s) => ({ ...s, ...patch }));

  // ── Phase 1: Select Profession ──────────────────────────────────
  const selectProfession = useCallback(async (profession) => {
    update({ loading: true, error: null, profession });
    try {
      const qs = await generateInterviewQuestions(profession.label);
      const personalQs = qs.personal || [];
      const professionalQs = (qs.professional || []).map(q => {
        if (q.id === 'work_experiences' || q.id === 'work_experience' || q.id === 'experience') {
          return { ...q, required: false };
        }
        if (q.id === 'projects' || q.id === 'project' || q.id === 'best_project' || q.id === 'key_projects') {
          return { ...q, required: false };
        }
        return q;
      });
      const allQs = [...personalQs, ...professionalQs];

      const firstQ = personalQs[0];
      update({
        phase: 'interview',
        questions: allQs,
        currentQIndex: 0,
        interviewGroup: 'personal',
        chatHistory: [
          { role: 'ai', text: `👋 Welcome to TalentIQ! I'm your AI career advisor. I'll be helping you build a world-class resume for the role of **${profession.label}**. Let's start with some basic information.` },
          { role: 'ai', text: firstQ?.question || 'What is your full name?' },
        ],
        loading: false,
        answers: {},
      });
    } catch (err) {
      update({ loading: false, error: err.message });
    }
  }, []);

  // ── Phase 2: Submit Answer ──────────────────────────────────────
  const submitAnswer = useCallback(async (answerText) => {
    const { questions, currentQIndex, answers, chatHistory, profession } = state;
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    const newAnswers = { ...answers, [currentQ.id]: answerText };

    let displayText = answerText || '(Skipped)';
    if (Array.isArray(answerText)) {
      if (answerText.length === 0) {
        displayText = '(Skipped)';
      } else if (currentQ.id?.includes('work') || currentQ.question?.toLowerCase().includes('work experience')) {
        displayText = `💼 Work Experience (${answerText.length} position${answerText.length > 1 ? 's' : ''}):\n` +
          answerText.map(j => `• ${j.role} at ${j.company} (${j.start_date || ''} – ${j.is_current ? 'Present' : (j.end_date || '')})`).join('\n');
      } else if (currentQ.id?.includes('edu') || currentQ.question?.toLowerCase().includes('education')) {
        displayText = `🎓 Education (${answerText.length} entry${answerText.length > 1 ? 'ies' : ''}):\n` +
          answerText.map(e => `• ${e.degree}${e.specialization ? ' in ' + e.specialization : ''} from ${e.institution} (${e.start_year || ''} - ${e.end_year || 'Present'})`).join('\n');
      } else if (currentQ.id?.includes('project') || currentQ.question?.toLowerCase().includes('project')) {
        displayText = `🚀 Projects (${answerText.length} project${answerText.length > 1 ? 's' : ''}):\n` +
          answerText.map(p => `• ${p.project_name}${p.technologies ? ' (' + p.technologies + ')' : ''}`).join('\n');
      }
    }

    const newHistory = [
      ...chatHistory,
      { role: 'user', text: displayText },
    ];

    const nextIndex = currentQIndex + 1;

    if (nextIndex < questions.length) {
      const nextQ = questions[nextIndex];
      update({
        answers: newAnswers,
        currentQIndex: nextIndex,
        chatHistory: [...newHistory, { role: 'ai', text: nextQ.question }],
      });
    } else {
      // All questions answered — start generation
      update({
        answers: newAnswers,
        chatHistory: [...newHistory, {
          role: 'ai',
          text: '✅ Perfect! I have all the information I need. Let me now generate your **professional resume** with AI enhancements. This will take about 20-30 seconds...',
        }],
      });
      await generateResume(newAnswers, profession);
    }
  }, [state]);

  // ── Phase 3: Skip Question ──────────────────────────────────────
  const skipQuestion = useCallback(() => {
    submitAnswer('');
  }, [submitAnswer]);

  // ── Phase 4-12: Generate All Resume Data ─────────────────────────
  const generateResume = useCallback(async (answers, profession) => {
    update({ phase: 'generating', loading: true, generatingStep: 'Validating resume details...' });

    try {
      const workExpInput = answers.work_experiences || answers.work_experience || answers.experience || [];
      const eduInput = answers.educations || answers.education || [];
      const projInput = answers.projects || answers.project || answers.best_project || answers.key_projects || [];

      // Pre-submit validation
      const validWorkExp = Array.isArray(workExpInput) ? workExpInput.filter(j => j.role && j.company) : [];
      const validEdu = Array.isArray(eduInput) ? eduInput.filter(e => e.degree && e.institution) : [];

      if (validWorkExp.length === 0 && validEdu.length === 0) {
        throw new Error('Please provide at least one Work Experience or Education entry before generating your resume.');
      }

      // Build raw resume data from answers
      const rawData = buildRawData(answers, profession);

      // Step 1: Enhance summary
      update({ generatingStep: '✨ Crafting ATS-optimized summary...' });
      const enhancedSummary = await enhanceSummary(profession.label, rawData);

      // Step 2: Rewrite work experience descriptions using AI while keeping structured fields
      update({ generatingStep: '💼 Rewriting experience with impact metrics...' });
      let processedWorkExp = [];
      let enhancedExpText = '';

      if (Array.isArray(workExpInput) && workExpInput.length > 0) {
        processedWorkExp = await Promise.all(workExpInput.map(async (exp) => {
          let enhancedDesc = exp.description || '';
          if (exp.description && exp.description.trim().length >= 10) {
            enhancedDesc = await enhanceExperience(exp.description, profession.label).catch(() => exp.description);
          }
          return {
            ...exp,
            enhancedDescription: enhancedDesc,
          };
        }));

        enhancedExpText = processedWorkExp.map(exp => (
          `• ${exp.role} at ${exp.company} (${exp.start_date || ''} - ${exp.is_current ? 'Present' : (exp.end_date || '')})\n${exp.enhancedDescription || exp.description || ''}`
        )).join('\n\n');
      } else if (typeof workExpInput === 'string' && workExpInput.trim()) {
        enhancedExpText = await enhanceExperience(workExpInput, profession.label).catch(() => workExpInput);
      }

      // Step 3: Enhance projects while keeping structured fields (github_link, live_link, tech)
      update({ generatingStep: '🚀 Generating professional project descriptions...' });
      let processedProjects = [];
      let enhancedProjText = '';

      if (Array.isArray(projInput) && projInput.length > 0) {
        processedProjects = await Promise.all(projInput.map(async (proj) => {
          let enhancedDesc = proj.description || '';
          if (proj.description && proj.description.trim().length >= 10) {
            enhancedDesc = await enhanceProjects(proj.description, proj.technologies || answers.skills || '', profession.label).catch(() => proj.description);
          }
          return {
            ...proj,
            enhancedDescription: enhancedDesc,
          };
        }));

        enhancedProjText = processedProjects.map(p => (
          `• ${p.project_name}${p.technologies ? ' (' + p.technologies + ')' : ''}\n${p.enhancedDescription || p.description || ''}`
        )).join('\n\n');
      } else if (typeof projInput === 'string' && projInput.trim()) {
        enhancedProjText = await enhanceProjects(projInput, answers.skills || '', profession.label).catch(() => projInput);
      }

      // Format education text for preview fallback
      let formattedEduText = '';
      if (Array.isArray(eduInput) && eduInput.length > 0) {
        formattedEduText = eduInput.map(e => (
          `• ${e.degree}${e.specialization ? ' in ' + e.specialization : ''} from ${e.institution} (${e.start_year || ''} - ${e.end_year || 'Present'})${e.percentage_or_cgpa ? ' | ' + e.percentage_or_cgpa : ''}`
        )).join('\n');
      } else if (typeof eduInput === 'string') {
        formattedEduText = eduInput;
      }

      // Build final resume data object
      const resumeData = {
        ...rawData,
        summary: enhancedSummary,
        experienceEnhanced: enhancedExpText,
        projectsEnhanced: enhancedProjText,
        // Structured project array preserves github_link / live_link for clickable rendering
        projectsStructured: processedProjects.length > 0 ? processedProjects : null,
        education: formattedEduText || rawData.education,
        resumeId: `TIQ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        templateName: 'TalentIQ-Professional-v1',
      };


      // Step 4: Skill Gap
      update({ generatingStep: '🎯 Identifying skill gaps...' });
      const gapData = await analyzeSkillGap(answers.skills || '', profession.label);

      // Step 6: Interview Prep
      update({ generatingStep: '💬 Generating interview questions...' });
      const interviewPrepData = await generateInterviewPrep(profession.label, answers.skills || '');

      // Step 7: Portfolio
      update({ generatingStep: '🌐 Building portfolio content...' });
      const portfolioData = await generatePortfolio(resumeData, profession.label);

      let savedResumeId = resumeData.resumeId;
      let publicResumeUrl = '';
      let resumeSaveStatus = 'Not Saved';

      // Auto-save generated resume to Django backend database
      try {
        update({ generatingStep: '💾 Saving resume to database...' });
        const apiBase = await getBackendUrl();
        
        const payload = {
          title: `${resumeData.name} - ${resumeData.profession}`,
          profession: resumeData.profession,
          professional_summary: resumeData.summary,
          template_name: resumeData.templateName || 'classic',
          is_public: true,
          personal_info: {
            full_name: resumeData.name,
            phone: resumeData.phone,
            email: resumeData.email,
            address: resumeData.address,
            linkedin_url: resumeData.linkedin && !resumeData.linkedin.startsWith('http') ? `https://${resumeData.linkedin}` : (resumeData.linkedin || ''),
            portfolio_url: resumeData.portfolio && !resumeData.portfolio.startsWith('http') ? `https://${resumeData.portfolio}` : (resumeData.portfolio || ''),
            github_url: resumeData.github && !resumeData.github.startsWith('http') ? `https://${resumeData.github}` : (resumeData.github || ''),
          },
          // ── Skills: detect category by keyword ─────────────────────
          skills: resumeData.skills
            ? resumeData.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => {
                const lower = s.toLowerCase();
                let category = 'Technical';
                if (['excel', 'word', 'powerpoint', 'ms office', 'autocad', 'revit', 'sap', 'tally'].some(t => lower.includes(t))) category = 'Tool';
                else if (['react', 'vue', 'angular', 'django', 'flask', 'spring', 'express', 'laravel', 'next', 'node'].some(t => lower.includes(t))) category = 'Framework';
                else if (['mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis', 'firebase'].some(t => lower.includes(t))) category = 'Database';
                else if (['communication', 'leadership', 'teamwork', 'problem solving', 'time management', 'analytical'].some(t => lower.includes(t))) category = 'Soft Skill';
                return { skill_name: s, skill_category: category };
              })
            : [],
          // ── Work Experience: direct structured mapping ─────────────
          work_experiences: processedWorkExp.length > 0
            ? processedWorkExp.map(exp => ({
                company: exp.company || 'Company',
                role: exp.role || resumeData.profession,
                start_date: exp.start_date || null,
                end_date: exp.is_current ? null : (exp.end_date || null),
                is_current: !!exp.is_current,
                description: exp.enhancedDescription || exp.description || '',
              }))
            : (typeof workExpInput === 'string' && workExpInput.trim() ? [{
                company: 'Company',
                role: resumeData.profession,
                description: enhancedExpText,
                is_current: true
              }] : []),
          // ── Education: direct structured mapping ──────────────────
          educations: Array.isArray(eduInput) && eduInput.length > 0
            ? eduInput.map(e => ({
                degree: e.degree || 'Degree',
                specialization: e.specialization || '',
                institution: e.institution || 'University',
                start_year: e.start_year ? parseInt(e.start_year, 10) : null,
                end_year: e.end_year ? parseInt(e.end_year, 10) : null,
                percentage_or_cgpa: e.percentage_or_cgpa || '',
              }))
            : (typeof eduInput === 'string' && eduInput.trim() ? [{ degree: eduInput, institution: '' }] : []),
          // ── Projects: direct structured mapping with GitHub/Live links ──
          projects: processedProjects.length > 0
            ? processedProjects.map(proj => ({
                project_name: proj.project_name || 'Project',
                technologies: proj.technologies || resumeData.skills || '',
                github_link: proj.github_link || '',
                live_link: proj.live_link || '',
                description: proj.enhancedDescription || proj.description || '',
              }))
            : (typeof projInput === 'string' && projInput.trim() ? [{
                project_name: projInput,
                description: enhancedProjText,
                technologies: resumeData.skills || '',
              }] : []),
          // ── Certifications ──────────────────────────────────────────
          certifications: resumeData.certifications ? parseCertificationsString(resumeData.certifications) : [],
          // ── Achievements ────────────────────────────────────────────
          achievements: resumeData.achievements
            ? resumeData.achievements.split('\n').map(a => a.trim()).filter(Boolean).map(a => ({
                achievement_title: a
              }))
            : [],
          // ── Languages ───────────────────────────────────────────────
          languages: resumeData.languages
            ? resumeData.languages.split(',').map(l => l.trim()).filter(Boolean).map(l => ({
                language_name: l,
                proficiency: 'Fluent'
              }))
            : [],
        };

        // Retry up to 3 times (Render may be mid-wake-up)
        let response = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            response = await fetch(`${apiBase}/api/resume/create/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (response.ok) break; // success — stop retrying
          } catch (fetchErr) {
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, 2000)); // wait 2s before retry
            }
          }
        }


        if (response.ok) {
          const resData = await response.json();
          savedResumeId = resData.resume_id;
          publicResumeUrl = resData.public_url;
          resumeSaveStatus = 'Saved';
        } else {
          resumeSaveStatus = 'Saved Locally';
        }
      } catch (e) {
        console.error("Failed to save resume to backend (using local storage):", e);
        resumeSaveStatus = 'Saved Locally';
      }

      // Always save to localStorage so QR code public URL works without backend
      saveResumeLocally(savedResumeId, resumeData);

      update({
        phase: 'results',
        loading: false,
        generatingStep: '',
        resumeData: {
          ...resumeData,
          resumeId: savedResumeId
        },
        gapData,
        interviewPrepData,
        portfolioData,
        activeTab: 0,
        publicResumeId: savedResumeId,
        publicResumeUrl: publicResumeUrl,
        resumeSaveStatus: resumeSaveStatus,
      });
    } catch (err) {
      update({ loading: false, error: err.message, generatingStep: '', phase: 'interview' });
    }
  }, []);

  const runJobMatch = useCallback(async (jobDescription) => {
    const { resumeData, profession } = state;
    update({ jobMatchLoading: true });
    try {
      const jobMatchData = await analyzeJobMatch(resumeData, jobDescription);
      
      const apiBase = await getBackendUrl();
      await fetch(`${apiBase}/api/resume/job-match/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: resumeData.resumeId,
          job_title: profession?.label || resumeData.profession || 'Full Stack Developer',
          company_name: '',
          job_description: jobDescription,
          match_score: jobMatchData.matchScore,
          matched_skills: jobMatchData.matchedSkills,
          missing_skills: jobMatchData.missingSkills,
          recommendations: jobMatchData.suggestions
        }),
      }).catch(e => console.error("Failed to save job match analysis to DB:", e));

      update({ jobMatchData, jobMatchLoading: false });
    } catch (err) {
      update({ jobMatchLoading: false, error: err.message });
    }
  }, [state]);

  // ── Restart ──────────────────────────────────────────────────────
  const restart = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ── Set Active Tab ────────────────────────────────────────────────
  const setActiveTab = useCallback((tab) => {
    update({ activeTab: tab });
  }, []);

  // ── Print Resume ──────────────────────────────────────────────────
  const printResume = useCallback(() => {
    window.print();
  }, []);

  return {
    ...state,
    selectProfession,
    submitAnswer,
    skipQuestion,
    runJobMatch,
    restart,
    setActiveTab,
    printResume,
    PROFESSIONS,
  };
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function buildRawData(answers, profession) {
  const workExpInput = answers.work_experiences || answers.work_experience || answers.experience || '';
  const expStr = Array.isArray(workExpInput)
    ? workExpInput.map(w => `${w.role} at ${w.company}`).join('; ')
    : String(workExpInput);

  const eduInput = answers.educations || answers.education || '';
  const eduStr = Array.isArray(eduInput)
    ? eduInput.map(e => `${e.degree} from ${e.institution}`).join('; ')
    : String(eduInput);

  const projInput = answers.projects || answers.project || answers.best_project || answers.key_projects || '';
  const projStr = Array.isArray(projInput)
    ? projInput.map(p => p.project_name).join('; ')
    : String(projInput);

  return {
    profession: profession.label,
    name: answers.name || answers.full_name || 'Candidate Name',
    phone: answers.phone || answers.phone_number || '',
    email: answers.email || answers.email_address || '',
    address: answers.address || answers.location || '',
    linkedin: answers.linkedin || answers.linkedin_url || '',
    portfolio: answers.portfolio || answers.portfolio_url || '',
    skills: answers.skills || answers.primary_skills || answers.technical_skills || '',
    experience: expStr,
    education: eduStr,
    projects: projStr,
    certifications: answers.certifications || answers.certificates || '',
    achievements: answers.achievements || answers.accomplishments || '',
    languages: answers.languages || 'English',
    summary: answers.summary || '',
    specialization: answers.specialization || '',
    subjects: answers.subjects || '',
    frameworks: answers.frameworks || '',
    databases: answers.databases || '',
    github: answers.github || '',
    mlLibraries: answers.ml_libraries || answers.ml_frameworks || '',
    hospitals: answers.hospitals || '',
    license: answers.license || answers.medical_license || '',
  };
}

export function parseCertificationsString(str) {
  if (!str) return [];
  const lines = str.split('\n').map(s => s.trim()).filter(Boolean);
  return lines.map(line => {
    // Strip bullet markers (•, -, *)
    let cleanLine = line.replace(/^[•\-\*\s]+/, '').trim();
    
    // Find a year e.g. (2025) or 2025
    let year = '';
    const yearMatch = cleanLine.match(/\((19|20)\d{2}\)$/) || cleanLine.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = yearMatch[0].replace(/[\(\)]/g, '');
      cleanLine = cleanLine.replace(yearMatch[0], '').trim();
      // Remove trailing hyphens or parentheses
      cleanLine = cleanLine.replace(/\(\s*\)$/, '').trim();
      cleanLine = cleanLine.replace(/-\s*$/, '').replace(/—\s*$/, '').trim();
    }
    
    // Split by - or — for issuer
    let name = cleanLine;
    let issuer = '';
    const splitIndex = cleanLine.indexOf('—') !== -1 ? cleanLine.indexOf('—') : cleanLine.indexOf('-');
    if (splitIndex !== -1) {
      name = cleanLine.substring(0, splitIndex).trim();
      issuer = cleanLine.substring(splitIndex + 1).trim();
    }
    
    return {
      certification_name: name,
      issuer: issuer,
      issue_date: year ? `${year}-01-01` : null
    };
  });
}
