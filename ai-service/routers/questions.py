import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.llm import get_llm_response

router = APIRouter()

QUESTIONS_SYSTEM_PROMPT = """You are an expert technical interviewer.
Generate targeted interview questions based on the candidate's profile, skill gaps, and job requirements.
Return a valid JSON object with:
{
  "technical_questions": [{"question": "", "purpose": "", "difficulty": "easy|medium|hard"}],
  "behavioral_questions": [{"question": "", "purpose": ""}],
  "project_questions": [{"question": "", "related_project": ""}],
  "gap_assessment": [{"question": "", "skill_gap": ""}]
}
Generate 3-4 questions per category. Return ONLY JSON, no markdown."""


class CandidateInfo(BaseModel):
    name: str | None = None
    skills: list = []
    experience_years: float = 0
    projects: list = []
    certifications: list = []


class JobInfo(BaseModel):
    title: str
    description: str
    experience: str | None = None


class QuestionsRequest(BaseModel):
    candidate: CandidateInfo
    job: JobInfo
    skill_gaps: list = []
    strengths: list = []


@router.post("/generate-questions")
async def generate_questions(req: QuestionsRequest):
    """Generate targeted interview questions for a specific candidate."""
    try:
        user_prompt = f"""
Candidate: {req.candidate.name or 'Unknown'}
Skills: {', '.join(str(s) for s in req.candidate.skills)}
Experience: {req.candidate.experience_years} years
Projects: {len(req.candidate.projects)}
Certifications: {len(req.candidate.certifications)}

Job Title: {req.job.title}
Job Description: {req.job.description}

Strengths: {', '.join(str(s) for s in req.strengths)}
Skill Gaps: {', '.join(str(s) for s in req.skill_gaps)}

Generate interview questions that:
1. Validate their claimed strengths
2. Assess their skill gaps
3. Explore their project experience
4. Evaluate cultural fit and growth potential
"""

        llm_response = get_llm_response(QUESTIONS_SYSTEM_PROMPT, user_prompt)

        cleaned = llm_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        questions = json.loads(cleaned)
        return questions

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse generated questions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
