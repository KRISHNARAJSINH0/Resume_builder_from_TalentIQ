/**
 * profileEvaluator.js  — TalentIQ Profile Strength & Weakness Engine
 * ===================================================================
 * Single source-of-truth for every category check.
 * No AI call, no fixed loops — each check reads real resumeData fields.
 *
 * Usage:
 *   import { evaluateProfile } from './profileEvaluator';
 *   const checks = evaluateProfile(resumeData);
 *   const strengths = checks.filter(c => c.status === 'pass');
 *   const weaknesses = checks.filter(c => c.status === 'fail');
 *
 * Acceptance criteria (spec):
 *   - evaluateProfile({}) returns 0 strength cards (all fail)
 *   - evaluateProfile(fullProfile) returns strength cards only for
 *     categories with real, quality-passing data.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True if a value is a non-empty string after trimming. */
const hasText = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * True if a value is a non-empty array, OR a non-empty comma/newline-split string.
 */
const hasList = (v) => {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') {
    return v.split(/[,\n•]+/).map(s => s.trim()).filter(Boolean).length > 0;
  }
  return false;
};

/**
 * Return the item count of a list field (array or comma/newline string).
 */
const listCount = (v) => {
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'string') {
    return v.split(/[,\n•]+/).map(s => s.trim()).filter(Boolean).length;
  }
  return 0;
};

/** True if text contains at least one quantifiable metric */
const hasQuantifiableMetric = (text) => {
  if (!hasText(text)) return false;
  return /(\d{2,}[%$]|[%$]\d+|\d{2,}\s*(users?|clients?|projects?|hours?|lpa|cr|lakhs?|million|k\b|months?|years?|days?)|\d+\.\d+)/i.test(text);
};

/** True if text has leadership language */
const hasLeadershipIndicators = (text) => {
  if (!hasText(text)) return false;
  return /(led|managed|mentored|directed|oversaw|coordinated|spearheaded|founded|supervised|trained|hired|built team|scaled|head of|lead|owner)/i.test(text);
};

/** True if URL is non-empty and looks like a URL */
const hasUrl = (v) => hasText(v) && /^(https?:\/\/|www\.|linkedin\.com|github\.com)/i.test(v.trim());

// ─── Category Evaluators ─────────────────────────────────────────────────────

const CHECKS = [

  // ── Personal Info ──────────────────────────────────────────────────────────

  (d) => {
    const phone = d.phone || d.personal_info?.phone;
    const ok = hasText(phone) && /\d{7,}/.test(phone.replace(/\D/g, ''));
    return {
      category: 'Phone Number',
      icon: '📞',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `Phone number present (${phone}).`
        : 'No valid phone number found. Recruiters need a direct contact.',
    };
  },

  (d) => {
    const addr = d.address || d.personal_info?.address;
    const ok = hasText(addr);
    return {
      category: 'Location',
      icon: '📍',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `Location provided: ${addr.trim().slice(0, 60)}.`
        : 'Location/city is missing. Many ATS systems filter by geography.',
    };
  },

  (d) => {
    const email = d.email || d.personal_info?.email;
    const ok = hasText(email) && /@/.test(email);
    return {
      category: 'Email Address',
      icon: '✉️',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `Email present: ${email}.`
        : 'No email address found. Essential for recruiter contact.',
    };
  },

  // ── Social / Online Presence ───────────────────────────────────────────────

  (d) => {
    const linkedin = d.linkedin || d.personal_info?.linkedin_url;
    const ok = hasText(linkedin) && /linkedin\.com/i.test(linkedin);
    return {
      category: 'LinkedIn Profile',
      icon: '🔗',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'LinkedIn URL present — recruiters can verify experience.'
        : 'LinkedIn URL missing. Profiles with LinkedIn are 40% more likely to be shortlisted.',
    };
  },

  (d) => {
    const github = d.github || d.personal_info?.github_url;
    const ok = hasText(github) && /github\.com/i.test(github);
    return {
      category: 'GitHub Profile',
      icon: '🐙',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'GitHub profile present — demonstrates active coding practice.'
        : 'GitHub URL missing. For technical roles, GitHub proves practical ability.',
    };
  },

  (d) => {
    const portfolio = d.portfolio || d.personal_info?.portfolio_url;
    const ok = hasUrl(portfolio);
    return {
      category: 'Portfolio / Website',
      icon: '🌐',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'Portfolio website linked — differentiates from other applicants.'
        : 'No portfolio/website URL. A personal site is a strong competitive advantage.',
    };
  },

  // ── Core Content ───────────────────────────────────────────────────────────

  (d) => {
    const summary = d.summary || d.professional_summary;
    const ok = hasText(summary) && summary.trim().split(/\s+/).length >= 25;
    return {
      category: 'Professional Summary',
      icon: '📝',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'Professional summary present with sufficient detail.'
        : 'Professional summary is missing or too short (needs ≥ 25 words). This is the first thing recruiters read.',
    };
  },

  (d) => {
    const skillCount = listCount(d.skills);
    const ok = skillCount >= 5;
    return {
      category: 'Skills Section',
      icon: '⚡',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `${skillCount} skills listed — good ATS keyword coverage.`
        : `Only ${skillCount} skill(s) listed. ATS systems expect at least 5 relevant skills.`,
    };
  },

  // ── Education ─────────────────────────────────────────────────────────────

  (d) => {
    const eduArray = d.educations || d.education_list;
    const eduString = d.education;
    const hasStructured = Array.isArray(eduArray) && eduArray.length > 0;
    const hasString = hasText(eduString);
    const ok = hasStructured || hasString;
    const detail = hasStructured
      ? `${eduArray.length} education entr${eduArray.length > 1 ? 'ies' : 'y'} with degree and institution.`
      : hasString
        ? 'Education section present.'
        : 'No education listed. Required for most roles and ATS filters.';
    return {
      category: 'Education',
      icon: '🎓',
      status: ok ? 'pass' : 'fail',
      detail,
    };
  },

  // ── Work Experience ───────────────────────────────────────────────────────

  (d) => {
    const expArray = d.work_experiences || d.workExperiences;
    const expString = d.experience || d.experienceEnhanced;
    const hasStructured = Array.isArray(expArray) && expArray.length > 0;
    const hasString = hasText(expString);
    const ok = hasStructured || hasString;
    return {
      category: 'Work Experience',
      icon: '💼',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? hasStructured
          ? `${expArray.length} work experience entr${expArray.length > 1 ? 'ies' : 'y'} present.`
          : 'Work experience section present.'
        : 'No work experience found. Even internships/freelance work should be listed.',
    };
  },

  // ── Quantifiable Metrics ──────────────────────────────────────────────────

  (d) => {
    const text = [
      d.experience, d.experienceEnhanced,
      d.projects, d.projectsEnhanced,
      d.summary, d.professional_summary,
    ].filter(Boolean).join(' ');
    const ok = hasQuantifiableMetric(text);
    return {
      category: 'Quantifiable Metrics',
      icon: '📊',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'Resume contains measurable achievements (%, numbers, scale) — this increases ATS scoring.'
        : 'No quantifiable metrics found. Add numbers, percentages, or scale (e.g. "Led team of 5", "Reduced load time by 40%").',
    };
  },

  // ── Leadership Indicators ─────────────────────────────────────────────────

  (d) => {
    const text = [
      d.experience, d.experienceEnhanced, d.summary, d.professional_summary,
    ].filter(Boolean).join(' ');
    const ok = hasLeadershipIndicators(text);
    return {
      category: 'Leadership Indicators',
      icon: '🏅',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? 'Strong action verbs and leadership language detected (Led, Managed, Mentored, etc.).'
        : 'No leadership verbs found. Use action words: Led, Managed, Mentored, Spearheaded to stand out.',
    };
  },

  // ── Projects ─────────────────────────────────────────────────────────────

  (d) => {
    const projArray = d.projects_structured || d.projectsStructured;
    const projString = d.projects || d.projectsEnhanced;
    const hasStructured = Array.isArray(projArray) && projArray.length > 0;
    const hasString = hasText(projString);
    const ok = hasStructured || hasString;
    return {
      category: 'Projects',
      icon: '🚀',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? hasStructured
          ? `${projArray.length} project(s) with title, tech stack, and description.`
          : 'Project section present.'
        : 'No projects listed. Projects demonstrate practical skills, especially for junior roles.',
    };
  },

  // ── Project Links ─────────────────────────────────────────────────────────

  (d) => {
    const projArray = d.projects_structured || d.projectsStructured;
    const hasLinks = Array.isArray(projArray) && projArray.some(
      p => hasText(p.github_link) || hasText(p.live_link)
    );
    return {
      category: 'Project Links (GitHub / Live Demo)',
      icon: '🔗',
      status: hasLinks ? 'pass' : 'fail',
      detail: hasLinks
        ? 'At least one project has a GitHub or Live Demo link — verifiable evidence of skills.'
        : 'No project links (GitHub/Live Demo). Linking code repositories significantly boosts credibility.',
    };
  },

  // ── Certifications ────────────────────────────────────────────────────────

  (d) => {
    const certArray = d.certifications_list || d.certificationsList;
    const certString = d.certifications;
    const hasStructured = Array.isArray(certArray) && certArray.length > 0;
    const hasString = hasText(certString);
    const ok = hasStructured || hasString;
    const count = hasStructured ? certArray.length : (hasString ? listCount(certString) : 0);
    return {
      category: 'Certifications',
      icon: '🏆',
      status: ok ? 'pass' : 'fail',
      detail: ok
        ? `${count > 0 ? count : 'Some'} certification(s) listed — demonstrates continued learning.`
        : 'No certifications listed. Even free online courses (Google, Coursera, AWS) add value.',
    };
  },

  // ── Achievements ──────────────────────────────────────────────────────────

  (d) => {
    /**
     * KEY FIX: Only generate an Achievements strength card when the resume
     * actually contains achievement data. Never iterate a fixed range().
     *
     * Quality bar: At least one achievement entry AND it must contain a
     * quantifiable metric OR a proper noun (award name, percentage, etc.)
     */
    const achArray = d.achievements_list || d.achievementsList;
    const achString = d.achievements;

    const rawAchievements = Array.isArray(achArray)
      ? achArray.map(a => (typeof a === 'string' ? a : a.achievement_title || '')).filter(Boolean)
      : (hasText(achString)
          ? achString.split(/[\n•]+/).map(s => s.trim()).filter(Boolean)
          : []);

    // Quality check: at least one entry AND has a number/award keyword
    const qualityAch = rawAchievements.filter(a =>
      hasQuantifiableMetric(a) ||
      /(award|winner|rank|top|first|gold|silver|scholarship|distinction|honor|honour|prize|1st|2nd|3rd)/i.test(a)
    );

    const hasAny = rawAchievements.length > 0;
    const hasQuality = qualityAch.length > 0;
    const ok = hasAny && hasQuality;

    let detail;
    if (ok) {
      detail = `${qualityAch.length} high-impact achievement(s) with measurable distinctions.`;
    } else if (hasAny) {
      detail = `${rawAchievements.length} achievement(s) listed but none contain measurable metrics or award keywords. Add context like "Ranked 2nd", "Reduced by 30%", or "Won Best Project Award".`;
    } else {
      detail = 'No achievements listed. Add awards, recognitions, hackathon wins, or notable milestones.';
    }

    return {
      category: 'Achievements & Awards',
      icon: '🥇',
      status: ok ? 'pass' : 'fail',
      detail,
    };
  },

];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Evaluate a resume data object against all category checks.
 * @param {Object} resumeData
 * @returns {Array<{category: string, icon: string, status: 'pass'|'fail', detail: string}>}
 */
export function evaluateProfile(resumeData = {}) {
  if (!resumeData || typeof resumeData !== 'object') return [];
  return CHECKS.map(check => check(resumeData));
}

/** Return only strength checks (status === 'pass'). Empty profile → []. */
export function getStrengths(resumeData) {
  return evaluateProfile(resumeData).filter(c => c.status === 'pass');
}

/** Return only weakness checks (status === 'fail'). */
export function getWeaknesses(resumeData) {
  return evaluateProfile(resumeData).filter(c => c.status === 'fail');
}

export default { evaluateProfile, getStrengths, getWeaknesses };
