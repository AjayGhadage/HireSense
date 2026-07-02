import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.llm import get_llm_response, RANK_SYSTEM_PROMPT
from services.embedder import semantic_skill_match

router = APIRouter()


class SkillItem(BaseModel):
    skill: str
    type: str = "required"


class JobPayload(BaseModel):
    id: int
    title: str
    description: str
    responsibilities: str | None = None
    experience: str | None = None
    education: str | None = None
    skills: list[SkillItem] = []


class CandidatePayload(BaseModel):
    id: int
    name: str | None = None
    skills: list = []
    experience_years: float = 0
    education_level: str | None = None
    experience_details: list = []
    projects: list = []
    certifications: list = []
    summary: str | None = None
    raw_parsed_data: dict | None = None


class RankRequest(BaseModel):
    job: JobPayload
    candidates: list[CandidatePayload]


@router.post("/rank-candidates")
async def rank_candidates(req: RankRequest):
    """Rank candidates for a job using semantic similarity + LLM scoring + behavioral signals."""
    if not req.candidates:
        raise HTTPException(status_code=400, detail="No candidates to rank")

    try:
        job = req.job
        job_skill_names = [s.skill for s in job.skills]

        # Fast text-matching filter definition
        def get_fast_match_score(cand_skills, job_skills):
            if not cand_skills or not job_skills:
                return 0.0
            cand_set = {s.lower().strip() for s in cand_skills}
            matches = sum(1.0 for js in job_skills if any(js.lower().strip() in cs or cs in js.lower().strip() for cs in cand_set))
            return round((matches / len(job_skills)) * 100, 2)

        fast_scores = {}

        # 2-stage hybrid ranking for large candidate pools
        if len(req.candidates) > 30:
            # First pass: compute fast string matches to select top 30
            for c in req.candidates:
                cand_skills = [s if isinstance(s, str) else str(s) for s in (c.skills or [])]
                fast_scores[c.id] = get_fast_match_score(cand_skills, job_skill_names)
            
            sorted_candidates = sorted(req.candidates, key=lambda c: (fast_scores.get(c.id, 0), c.experience_years), reverse=True)
            candidates_to_llm = sorted_candidates[:30]
            remaining_candidates = sorted_candidates[30:]
        else:
            candidates_to_llm = req.candidates
            remaining_candidates = []

        # Second pass: compute heavy SentenceTransformer embeddings only for the top candidates
        semantic_scores = {}
        for c in candidates_to_llm:
            cand_skills = [s if isinstance(s, str) else str(s) for s in (c.skills or [])]
            score = semantic_skill_match(cand_skills, job_skill_names) if job_skill_names and cand_skills else 0
            semantic_scores[c.id] = score

        # Build a concise prompt for the LLM
        job_text = f"""
Job: {job.title}
Description: {job.description}
Required Skills: {', '.join(job_skill_names)}
Experience: {job.experience or 'Not specified'}
Education: {job.education or 'Not specified'}
"""

        candidates_text = ""
        for c in candidates_to_llm:
            signals = {}
            if c.raw_parsed_data and "redrob_signals" in c.raw_parsed_data:
                signals = c.raw_parsed_data["redrob_signals"]
            
            sig_text = ""
            if signals:
                sig_text = f"\n- Notice: {signals.get('notice_period_days', 60)}d, Resp: {int(signals.get('recruiter_response_rate', 0.5)*100)}%, Active: {signals.get('last_active_date', 'N/A')}"

            # Compress summary & skills to fit in Groq limits
            c_skills = c.skills or []
            short_skills = ", ".join(str(s) for s in c_skills[:10])
            short_sum = (c.summary or "N/A")[:100]

            candidates_text += f"""
---
Candidate ID: {c.id}
Skills: {short_skills}
Exp: {c.experience_years}y, Edu: {c.education_level or 'Bachelor'}
Semantic Match: {semantic_scores.get(c.id, 0):.1f}%{sig_text}
Summary: {short_sum}
"""

        user_prompt = f"""Rank and score these candidates for the job. Use the pre-computed semantic skill match as a strong signal. Include behavioral signals (e.g. response rate, notice days) in your overall feedback.

{job_text}

Candidates:
{candidates_text}"""

        print(f"[AI Service] DEBUG PROMPT LENGTH: {len(user_prompt)} chars, candidates count: {len(candidates_to_llm)}")
        try:
            import os
            os.makedirs("../tmp", exist_ok=True)
            with open("../tmp/debug_prompt.txt", "w", encoding="utf-8") as df:
                df.write(user_prompt)
            print("[AI Service] Saved debug prompt to tmp/debug_prompt.txt")
        except Exception as df_err:
            print("[AI Service] Failed to write debug prompt:", df_err)

        llm_response = get_llm_response(RANK_SYSTEM_PROMPT, user_prompt)

        # Parse LLM JSON
        cleaned = llm_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        rankings = json.loads(cleaned)

        # Construct fallback rankings for the remaining candidates beyond top 30
        fallback_rankings = []
        for c in remaining_candidates:
            # If we didn't calculate fast_scores for small pools, calculate them here
            m_score = fast_scores.get(c.id, 0) if c.id in fast_scores else get_fast_match_score([s if isinstance(s, str) else str(s) for s in c.skills], job_skill_names)
            fallback_rankings.append({
                "candidate_id": c.id,
                "match_score": m_score,
                "skill_match_score": m_score,
                "experience_score": min(100.0, c.experience_years * 10),
                "education_score": 50.0,
                "project_score": 50.0,
                "certification_score": 50.0,
                "strengths": ["Matches core skill profile"],
                "skill_gaps": [],
                "explanation": "Pre-ranked in secondary leaderboard using semantic database retrieval.",
                "interview_recommendation": m_score >= 80.0
            })
        
        rankings.extend(fallback_rankings)

        # Apply deterministic Python-side post-processing rules for behavioral signals & JD negative filters
        for r in rankings:
            cid = r.get("candidate_id")
            cand = next((c for c in req.candidates if c.id == cid), None)
            if cand:
                signals = {}
                if cand.raw_parsed_data and "redrob_signals" in cand.raw_parsed_data:
                    signals = cand.raw_parsed_data["redrob_signals"]
                
                m_score = r.get("match_score", 50.0)
                behavioral_ratio = 1.0
                penalties = 0
                warnings_inf = []

                # 1. Notice Period
                notice_days = signals.get("notice_period_days", 60)
                if notice_days > 90:
                    penalties -= 15
                    warnings_inf.append(f"Notice: {notice_days}d")
                elif notice_days > 30:
                    penalties -= 5
                
                # 2. Recruiter Response & Activity
                res_rate = signals.get("recruiter_response_rate", 0.5)
                if res_rate < 0.25:
                    penalties -= 15
                    warnings_inf.append(f"Response: {int(res_rate*100)}%")
                elif res_rate >= 0.8:
                    behavioral_ratio += 0.05
                
                last_active_str = signals.get("last_active_date", "2026-01-01")
                try:
                    from datetime import datetime
                    la_dt = datetime.strptime(last_active_str, "%Y-%m-%d")
                    curr_dt = datetime(2026, 7, 2)
                    diff_days = (curr_dt - la_dt).days
                    if diff_days > 180:
                        penalties -= 20
                        warnings_inf.append(f"Inactive: {diff_days}d")
                    elif diff_days <= 30:
                        behavioral_ratio += 0.05
                except:
                    pass

                # 3. Location fit (Pune/Noida Hybrid)
                work_mode = signals.get("preferred_work_mode", "hybrid")
                relocate = signals.get("willing_to_relocate", False)
                is_local = False
                if cand.raw_parsed_data and "profile" in cand.raw_parsed_data and "location" in cand.raw_parsed_data["profile"]:
                    loc = cand.raw_parsed_data["profile"]["location"].lower()
                    if any(x in loc for x in ["pune", "noida", "delhi", "ncr", "gurgaon"]):
                        is_local = True
                
                if not is_local and not relocate and work_mode != "remote":
                    penalties -= 15
                    warnings_inf.append("Non-local/no-relocation")
                
                # 4. Consulting Companies
                exp_list = cand.raw_parsed_data.get("career_history", []) if cand.raw_parsed_data else []
                consulting_firms = ["tcs", "tata consultancy services", "infosys", "wipro", "accenture", "cognizant", "capgemini"]
                if exp_list:
                    has_only_consulting = all(
                        any(firm in str(job.get("company", "")).lower() for firm in consulting_firms)
                        for job in exp_list
                    )
                    if has_only_consulting:
                        penalties -= 20
                        warnings_inf.append("Consulting-only background")

                # 5. Honeypot check
                skills_list = cand.raw_parsed_data.get("skills", []) if cand.raw_parsed_data else []
                has_honeypot = False
                expert_skills = 0
                for s in skills_list:
                    prof = str(s.get("proficiency", "")).lower()
                    dur = s.get("duration_months", 0)
                    if prof == "expert":
                        expert_skills += 1
                        if dur == 0 or dur < 6:
                            has_honeypot = True
                
                if has_honeypot or (expert_skills > 6 and cand.experience_years < 3):
                    penalties -= 45
                    r["interview_recommendation"] = False
                    warnings_inf.append("Fake-profile/Honeypot flag")

                # Calculate final score
                final_score = int((m_score + penalties) * behavioral_ratio)
                final_score = min(100, max(0, final_score))
                
                r["match_score"] = final_score
                if warnings_inf:
                    r["explanation"] = r.get("explanation", "") + " [Signal Concerns: " + ", ".join(warnings_inf) + "]"
                    if "Fake-profile/Honeypot flag" in warnings_inf or "Inactive" in warnings_inf:
                        r["interview_recommendation"] = False

        # Sort by match_score descending
        rankings.sort(key=lambda r: r.get("match_score", 0), reverse=True)

        return {"rankings": rankings}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM returned invalid ranking JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
