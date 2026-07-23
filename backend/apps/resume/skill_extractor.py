import re
import spacy
from spacy.matcher import PhraseMatcher

# Load spacy model dynamically
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    # If not loaded, download/use a blank model to avoid crash
    nlp = spacy.blank("en")

SKILLS_DICTIONARY = {
    # Technical / Programming Languages
    "python": "Technical",
    "javascript": "Technical",
    "typescript": "Technical",
    "java": "Technical",
    "c++": "Technical",
    "c#": "Technical",
    "ruby": "Technical",
    "php": "Technical",
    "swift": "Technical",
    "golang": "Technical",
    "rust": "Technical",
    "kotlin": "Technical",
    "scala": "Technical",
    "sql": "Technical",
    
    # Frameworks
    "django": "Framework",
    "flask": "Framework",
    "fastapi": "Framework",
    "react": "Framework",
    "vue": "Framework",
    "angular": "Framework",
    "svelte": "Framework",
    "next.js": "Framework",
    "nextjs": "Framework",
    "express": "Framework",
    "spring boot": "Framework",
    "laravel": "Framework",
    "ruby on rails": "Framework",
    
    # Databases
    "postgresql": "Database",
    "postgres": "Database",
    "mysql": "Database",
    "sqlite": "Database",
    "mongodb": "Database",
    "redis": "Database",
    "elasticsearch": "Database",
    "dynamodb": "Database",
    "cassandra": "Database",
    "oracle": "Database",

    # Tools / Cloud / DevOps
    "aws": "Tool",
    "docker": "Tool",
    "kubernetes": "Tool",
    "git": "Tool",
    "jenkins": "Tool",
    "terraform": "Tool",
    "ansible": "Tool",
    "prometheus": "Tool",
    "grafana": "Tool",
    "azure": "Tool",
    "gcp": "Tool",
    "jira": "Tool",
    "figma": "Tool",
    
    # Soft Skills
    "communication": "Soft Skill",
    "leadership": "Soft Skill",
    "teamwork": "Soft Skill",
    "collaboration": "Soft Skill",
    "problem solving": "Soft Skill",
    "critical thinking": "Soft Skill",
    "time management": "Soft Skill",
    "adaptability": "Soft Skill"
}

def extract_skills(text):
    """
    Extracts and categorizes skills from the resume text using SpaCy.
    Returns a list of dictionaries: [{"skill_name": "Python", "skill_category": "Technical"}]
    """
    doc = nlp(text.lower())
    extracted = set()
    
    # Phrase matching with SpaCy matcher
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in SKILLS_DICTIONARY.keys()]
    matcher.add("SKILLS", patterns)
    
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        extracted.add(span.text)
        
    # Regex fallback for single character skills (like C, R, Go) and edge cases
    single_char_skills = ["c", "r", "go"]
    for skill in single_char_skills:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            extracted.add(skill)

    # Resolve duplicates (e.g. postgres vs postgresql)
    unique_skills = []
    seen = set()
    
    # Resolve aliases/synonyms and map categories
    for skill_name in extracted:
        # Normalize name based on dict keys
        normal_key = skill_name.strip().lower()
        
        # Mapping postgres -> postgresql, nextjs -> next.js
        if normal_key == "postgres":
            normal_key = "postgresql"
        elif normal_key == "nextjs":
            normal_key = "next.js"
            
        if normal_key in SKILLS_DICTIONARY:
            display_name = [k for k in SKILLS_DICTIONARY.keys() if k == normal_key or (normal_key == "postgresql" and k == "postgresql") or (normal_key == "next.js" and k == "next.js")][0]
            # Capitalize properly
            capitalized_name = display_name.title()
            if capitalized_name == "Aws": capitalized_name = "AWS"
            elif capitalized_name == "Sql": capitalized_name = "SQL"
            elif capitalized_name == "Gcp": capitalized_name = "GCP"
            elif capitalized_name == "Next.Js": capitalized_name = "Next.js"
            elif capitalized_name == "Fastapi": capitalized_name = "FastAPI"
            
            if capitalized_name not in seen:
                seen.add(capitalized_name)
                unique_skills.append({
                    "skill_name": capitalized_name,
                    "skill_category": SKILLS_DICTIONARY[display_name]
                })
                
    return unique_skills
