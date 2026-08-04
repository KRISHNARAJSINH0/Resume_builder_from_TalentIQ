// TalentIQ Resume Intelligence Engine — Groq API Layer
// VITE_GROQ_API_KEY is injected at build time from Vercel environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export async function groqChat(messages, temperature = 0.7, maxTokens = 2048) {
  if (!GROQ_API_KEY) {
    throw new Error('Invalid API Key');
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `AI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}



/** Parse a JSON block from LLM output robustly */
export function parseJSON(raw) {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract first JSON object/array
    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) return JSON.parse(match[1]);
    throw new Error('Could not parse JSON from LLM response');
  }
}

// ─────────────────────────────────────────────────────────────────
// PHASE PROMPTS
// ─────────────────────────────────────────────────────────────────

/** Phase 2: Generate dynamic interview questions for profession */
export async function generateInterviewQuestions(profession) {
  const raw = await groqChat([
    {
      role: 'system',
      content: `You are TalentIQ, a professional AI recruiter. Generate a structured interview question list to collect resume data.
Output ONLY valid JSON — no markdown, no explanation.`,
    },
    {
      role: 'user',
      content: `Generate interview questions for a "${profession}" resume. 
Include: personal info questions (name, phone, email, address, linkedin, portfolio), then profession-specific questions about skills, work_experiences, educations, projects, certifications, achievements.
You MUST include questions with exact IDs: "skills", "work_experiences", "educations", "projects", "certifications".
For EVERY question, you MUST include a "suggestions" key containing an array of 4-6 appropriate, context-specific suggestion chips.
Format: 
{
  "personal": [
    {"id":"name","question":"What is your full name?","placeholder":"e.g. Arjun Sharma","required":true,"suggestions":["Arjun Sharma","Priya Patel"]},
    {"id":"linkedin","question":"What is your LinkedIn URL? (Optional)","placeholder":"e.g. linkedin.com/in/username","required":false,"suggestions":["linkedin.com/in/johndoe","Skip"]}
  ],
  "professional": [
    {"id":"skills","question":"Which primary skills or technologies do you work with?","required":true,"suggestions":["React","JavaScript","Python","Django","SQL"]},
    {"id":"work_experiences","question":"Please detail your Work Experience (Role, Company, Dates, Responsibilities) (Optional).","placeholder":"","required":false,"suggestions":["Add Current Job","Add Past Role"]},
    {"id":"educations","question":"Please detail your Education (Degree, Institution, Graduation Year, CGPA/Percentage).","placeholder":"","required":true,"suggestions":["B.Tech Computer Science","MBA","Bachelor of Commerce"]},
    {"id":"projects","question":"Please detail your Key Projects (Title, Technologies, GitHub/Live URLs, Description) (Optional).","placeholder":"","required":false,"suggestions":["E-Commerce App","Portfolio Website","AI Resume Builder"]},
    {"id":"certifications","question":"What professional certifications do you hold? For each one, include the credential link if available.","placeholder":"e.g. AWS Cloud Practitioner – https://credly.com/badges/xyz","required":false,"suggestions":["AWS Certified Cloud Practitioner","Google Project Management Certificate","None"]},
    {"id":"job_description","question":"Paste a Target Job Description (or target keywords) to optimize your resume specifically for that role (Optional).","placeholder":"Paste the full job description or key requirements here...","required":false,"suggestions":["Skip"]}
  ]
}`,
    },
  ], 0.3, 2000);
  return parseJSON(raw);
}

/** Unified ATS Resume Generation using candidate input, target profession, and JD */
export async function generateATSResume(rawUserInput, targetProfession, jdText = '', jdKeywords = '') {
  const systemPrompt = `You are an expert resume writer and ATS optimization specialist. Your job is to
transform a candidate's raw input into resume content that is (a) fully honest,
(b) ATS-parseable by construction, and (c) tightly aligned to a specific job
description. You never invent experience, skills, or metrics the candidate did
not provide.

═══════════════════════════════════════
HARD RULES (non-negotiable, violating any of these fails validation)
═══════════════════════════════════════
1. NEVER fabricate: no invented employers, titles, dates, tools, certifications,
   or metrics. If the candidate gave no number for an achievement, write it
   qualitatively — do not insert a fake percentage or dollar figure.
2. Every bullet starts with a strong past/present-tense action verb
   (Built, Led, Reduced, Designed, Automated, Owned) — never "Responsible for"
   or "Worked on".
3. Every bullet follows: [Action] + [What/How] + [Quantifiable outcome, if the
   candidate provided one]. If no outcome was given, end after [What/How] —
   do not pad with invented impact.
4. Use JD keywords ONLY where they are truthfully applicable to what the
   candidate actually did. Do not keyword-stuff a bullet with a tool the
   candidate never mentioned using.
5. Plain text only. No tables, no special characters for bullets other than
   a single standard "-" or "•", no text boxes, no icons carrying information,
   no columns. Section headers must be exactly one of:
   "Summary", "Skills", "Experience", "Education", "Projects", "Certifications".
6. Dates in MM/YYYY – MM/YYYY format, consistent across all entries.
7. Output length: bullets are 1–2 lines each, max 6 bullets per role.

═══════════════════════════════════════
CONTENT PRIORITIES (in order)
═══════════════════════════════════════
1. Truthful representation of the candidate's actual experience
2. Natural inclusion of JD keywords the candidate genuinely has grounds for
3. Quantification wherever the candidate supplied a number
4. Seniority-appropriate language matched to target profession conventions

═══════════════════════════════════════
OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no preamble
═══════════════════════════════════════
{
  "summary": "2-3 line professional summary, JD-aligned",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "...",
      "company": "...",
      "dates": "MM/YYYY - MM/YYYY",
      "bullets": ["...", "..."]
    }
  ],
  "projects": [
    {
      "title": "...",
      "tech_stack": "...",
      "bullets": ["...", "..."]
    }
  ],
  "education": [
    {
      "degree": "...",
      "institution": "...",
      "dates": "MM/YYYY - MM/YYYY"
    }
  ],
  "keywords_used": ["list of JD keywords naturally incorporated"],
  "keywords_skipped": ["JD keywords NOT used, with reason — e.g. 'no supporting experience provided by candidate'"]
}`;

  const userContent = `═══════════════════════════════════════
CANDIDATE INPUT
═══════════════════════════════════════
Raw background: ${typeof rawUserInput === 'string' ? rawUserInput : JSON.stringify(rawUserInput)}
Target role/profession: ${targetProfession}
Target job description: ${jdText || 'None provided'}
Extracted JD keywords (hard skills, tools, certs, seniority terms): ${jdKeywords || 'None provided'}`;

  const raw = await groqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ], 0.3, 3000);

  return parseJSON(raw);
}

/** Phase 4: Enhance professional summary */
export async function enhanceSummary(profession, rawData) {
  return groqChat([
    {
      role: 'system',
      content: `You are an expert executive resume writer. Write an ATS-optimized 3-sentence professional summary grounded in the candidate's actual input.

CRITICAL RULES & CONSTRAINTS:
1. FORBIDDEN BUZZWORDS: Do NOT use stock clichés or buzzwords such as "results-driven", "proven track record", "passion for delivering high-quality products", "hardworking professional", "detail-oriented", or "team player".
2. NO REPETITION & NO FILLER: Do not repeat terms or mention the candidate's degree/field multiple times. Each sentence must provide distinct, substantive information.
3. CONTEXT-BASED: Base claims directly on the skills, profession, and details in the candidate data.
4. FORMAT: Output ONLY the 3-sentence summary text with no commentary or markdown.`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nCandidate data: ${JSON.stringify(rawData)}`,
    },
  ], 0.6, 250);
}

/** Phase 4: Rewrite experience bullets */
export async function enhanceExperience(experience, profession) {
  if (!experience || experience.trim().length < 10) return experience;
  return groqChat([
    {
      role: 'system',
      content: `You are a resume expert. Rewrite the experience into 3-4 powerful bullet points using strong action verbs (Led, Built, Optimized, Delivered, Architected, Reduced, Increased). Focus on measurable impact. Output ONLY bullet points, one per line starting with •`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nExperience to rewrite: ${experience}`,
    },
  ], 0.5, 300);
}

/** Phase 4: Generate project descriptions */
export async function enhanceProjects(projects, skills, profession) {
  return groqChat([
    {
      role: 'system',
      content: `You are a resume writer. For each project, write a professional 2-sentence description mentioning technologies and measurable outcome. Output ONLY the enhanced project descriptions in the same order.`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nSkills: ${skills}\nProjects: ${projects}`,
    },
  ], 0.5, 400);
}

/** Phase 6: Skill Gap Analysis */
export async function analyzeSkillGap(currentSkills, profession) {
  const raw = await groqChat([
    {
      role: 'system',
      content: `You are a career advisor. Output ONLY valid JSON.`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nCurrent skills: ${currentSkills}
Identify missing in-demand skills and provide a 90-day roadmap:
{
  "currentSkills": ["skill1","skill2"],
  "missingSkills": [{"name":"<skill>","priority":"High|Medium|Low","resource":"<course/platform>","timeWeeks":<number>}],
  "roadmap": [{"week":"Week 1-2","title":"<milestone>","description":"<what to do>"}],
  "careerBoost": "<one sentence on career impact>"
}`,
    },
  ], 0.4, 800);
  return parseJSON(raw);
}

/** Phase 7: Job Match Analysis */
export async function analyzeJobMatch(resumeData, jobDescription) {
  const raw = await groqChat([
    {
      role: 'system',
      content: `You are an ATS (Applicant Tracking System) and resume-matching engine for TalentIQ.
Compare a RESUME and a JOB DESCRIPTION to evaluate candidates.

Rules:
- Score the resume's match to the job on a 0-100 scale (returned in "score").
- Identify exact phrases/keywords from the resume that positively contributed to the score (returned in "matched_phrases"). Every item must be an exact substring copyable from the resume.
- Identify exact keywords/skills required by the job description that are MISSING from the resume (returned in "missing_keywords"). Every item must be an exact substring copyable from the job description.
- Identify exact phrases in the resume that are weak or vague (e.g., "worked on team projects") and suggest a stronger rewrite (returned in "weak_phrases" as objects containing "phrase" and "suggestion").
- Give a short (2-3 sentence) plain-English explanation of the score (returned in "explanation").
- Weight hard skills (tools, languages, frameworks) higher than soft skills.
- Penalize keyword-stuffing: repeating a term does not increase its weight.
- Return ONLY valid JSON. No markdown code fences, preamble, or explanations.`,
    },
    {
      role: 'user',
      content: `Resume: ${JSON.stringify(resumeData)}
Job Description: ${jobDescription}

Output ONLY a JSON object with exactly these keys (no extra text, no markdown fences):
{
  "score": <integer between 0 and 100 based on your analysis>,
  "matched_phrases": ["<exact phrase from resume>", "..."],
  "missing_keywords": ["<exact keyword from JD missing in resume>", "..."],
  "weak_phrases": [
    {
      "phrase": "<vague phrase from resume>",
      "suggestion": "<stronger rewrite>"
    }
  ],
  "explanation": "<2-3 sentence explanation of the score>"
}`,
    },
  ], 0.2, 1000);

  const data = parseJSON(raw);
  
  // Backward compatibility formatting
  let verdict = 'Weak Match';
  if (data.score >= 80) verdict = 'Strong Match';
  else if (data.score >= 60) verdict = 'Good Match';
  else if (data.score >= 40) verdict = 'Partial Match';

  return {
    ...data,
    matchScore: data.score,
    verdict,
    matchedSkills: data.matched_phrases || [],
    missingSkills: data.missing_keywords || [],
    suggestions: (data.weak_phrases || []).map(wp => `"${wp.phrase}" → ${wp.suggestion}`)
  };
}

/** Phase 12: Generate Interview Questions */
export async function generateInterviewPrep(profession, skills) {
  const raw = await groqChat([
    {
      role: 'system',
      content: `You are a technical interview coach. Generate questions for three levels. Output ONLY valid JSON.`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nSkills: ${skills}
Output:
{
  "beginner": [{"q":"<question>","hint":"<answer hint>"},... (10 items)],
  "intermediate": [{"q":"<question>","hint":"<answer hint>"},... (10 items)],
  "advanced": [{"q":"<question>","hint":"<answer hint>"},... (10 items)]
}`,
    },
  ], 0.5, 2000);
  return parseJSON(raw);
}

/** Phase 11: Portfolio Content */
export async function generatePortfolio(resumeData, profession) {
  const raw = await groqChat([
    {
      role: 'system',
      content: `You are a portfolio content writer. Write professional portfolio page content. Output ONLY valid JSON.`,
    },
    {
      role: 'user',
      content: `Profession: ${profession}\nResume: ${JSON.stringify(resumeData)}
Output:
{
  "aboutMe": "<3-4 sentence personal brand statement>",
  "tagline": "<catchy one-liner for hero section>",
  "skills": ["<skill1>","<skill2>","<skill3>","<skill4>","<skill5>","<skill6>"],
  "projects": [{"title":"<name>","description":"<2 sentences>","tech":["<tech1>","<tech2>"]}],
  "achievements": ["<achievement1>","<achievement2>","<achievement3>"],
  "cta": "<call to action text>"
}`,
    },
  ], 0.6, 800);
  return parseJSON(raw);
}

/** Extract structured certification details from raw text / filename hint */
export async function parseCertificateText(text) {
  try {
    const raw = await groqChat([
      {
        role: 'system',
        content: `You are an expert resume assistant. Extract professional certification details from the provided certificate text/filename.
Output ONLY a valid JSON object with keys "name", "issuer", and "issue_date". Do not include markdown code fences or explanations.
If a field cannot be found, use an empty string. The "issue_date" field should be a year (e.g. "2025") or formatted date (e.g. "2025-01-01").
Example output:
{
  "name": "Google UX Design Professional Certificate",
  "issuer": "Coursera",
  "issue_date": "2025"
}`,
      },
      {
        role: 'user',
        content: `Certificate text/details: ${text}`,
      },
    ], 0.2, 500);
    return parseJSON(raw);
  } catch (err) {
    console.error("Failed to parse certificate text with Groq:", err);
    return { name: '', issuer: '', issue_date: '' };
  }
}

/**
 * TalentIQ Resume Assistant — Conversational AI
 */
export async function assistantChat(conversationHistory, resumeContext = {}) {
  const contextSummary = buildContextSummary(resumeContext);

  const systemPrompt = `You are TalentIQ Resume Assistant, an AI helper integrated inside a Resume Builder platform.
Your purpose is to help users create better resumes, understand resume-related issues, and get personalized career suggestions.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
  ];

  return groqChat(messages, 0.65, 1024);
}

function buildContextSummary(ctx) {
  if (!ctx || Object.keys(ctx).length === 0) return 'No resume data available yet.';
  const lines = [];
  if (ctx.profession?.label) lines.push(`Profession: ${ctx.profession.label}`);
  return lines.length > 0 ? lines.join('\n') : 'Resume data is being collected.';
}

export default {
  groqChat, parseJSON,
  generateInterviewQuestions, enhanceSummary, enhanceExperience,
  enhanceProjects, analyzeSkillGap, analyzeJobMatch,
  generateInterviewPrep, generatePortfolio, parseCertificateText,
  assistantChat,
};
