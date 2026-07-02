from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.llm import get_llm_response

router = APIRouter()

CHAT_SYSTEM_PROMPT = """You are an AI recruitment assistant for HireSense AI.
You help recruiters understand candidate rankings, compare candidates, and make hiring decisions.
You have access to the job details and candidate ranking data provided in context.
Be concise, data-driven, and helpful. Use specific scores and evidence from candidates' profiles.
When comparing candidates, use tables or structured formats."""


class CandidateContext(BaseModel):
    name: str | None = None
    match_score: float = 0
    rank_position: int = 0
    strengths: list = []
    skill_gaps: list = []
    experience_years: float = 0
    skills: list = []


class JobContext(BaseModel):
    title: str
    description: str
    skills: list = []


class ChatRequest(BaseModel):
    question: str
    job: JobContext
    candidates: list[CandidateContext] = []


@router.post("/chat")
async def ai_chat(req: ChatRequest):
    """Natural language AI recruiter assistant with job/candidate context."""
    try:
        context = f"""
Job: {req.job.title}
Description: {req.job.description}

Top Candidates:
"""
        for c in req.candidates:
            context += f"""
- {c.name or 'Unknown'} (Rank #{c.rank_position}, Score: {c.match_score}%)
  Skills: {', '.join(str(s) for s in c.skills)}
  Experience: {c.experience_years} years
  Strengths: {', '.join(str(s) for s in c.strengths)}
  Gaps: {', '.join(str(s) for s in c.skill_gaps)}
"""

        user_prompt = f"""Context:\n{context}\n\nRecruiter's Question: {req.question}"""

        answer = get_llm_response(CHAT_SYSTEM_PROMPT, user_prompt)

        return {"answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
