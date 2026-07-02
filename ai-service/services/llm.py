import os
from groq import Groq
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "groq")
MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")


def get_llm_response(system_prompt: str, user_prompt: str) -> str:
    """Call configured LLM provider and return the text response."""

    if PROVIDER == "groq":
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=4096,
        )
        return completion.choices[0].message.content

    elif PROVIDER == "gemini":
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
        return response.text

    else:
        raise ValueError(f"Unknown LLM provider: {PROVIDER}")


# ─── Shared system prompts ─────────────────────────────────────────────────────

PARSE_SYSTEM_PROMPT = """You are an expert resume parser. Extract structured information from the resume text.
Return a valid JSON object with these exact keys:
{
  "name": string or null,
  "email": string or null,
  "phone": string or null,
  "summary": string or null,
  "skills": [list of skill strings],
  "experience_years": float,
  "experience": [{"company": "", "role": "", "duration": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "field": "", "year": ""}],
  "education_level": "High School" | "Bachelor" | "Master" | "PhD" | "Other",
  "projects": [{"name": "", "description": "", "technologies": []}],
  "certifications": [{"name": "", "issuer": "", "year": ""}],
  "languages": [list of language strings]
}
Return ONLY the JSON, no markdown, no explanation."""

RANK_SYSTEM_PROMPT = """You are an expert AI technical recruiter. Analyze candidates against a job description.
For each candidate, score them from 0-100 on:
- skill_match_score: how well their skills match required and preferred job skills
- experience_score: relevance and depth of their experience
- education_score: education alignment with requirements
- project_score: quality and relevance of projects
- certification_score: relevant certifications

Then compute a weighted match_score:
  match_score = 0.35*skill_match + 0.25*experience + 0.20*projects + 0.10*education + 0.10*certifications

Return a valid JSON array, each item:
{
  "candidate_id": int,
  "match_score": float,
  "skill_match_score": float,
  "experience_score": float,
  "education_score": float,
  "project_score": float,
  "certification_score": float,
  "strengths": [list of 3-5 key strength strings],
  "skill_gaps": [list of missing skills],
  "explanation": "2-3 sentence summary explaining the ranking",
  "interview_recommendation": boolean
}
Sort by match_score descending. Return ONLY the JSON array."""
