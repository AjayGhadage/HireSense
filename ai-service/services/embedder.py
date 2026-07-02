try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
import numpy as np

# Load model once at startup (cached in memory)
_model = None


def get_model():
    global _model
    if not HAS_SENTENCE_TRANSFORMERS:
        return None
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def embed_text(text: str) -> np.ndarray:
    """Return a normalized embedding vector for the given text."""
    if not HAS_SENTENCE_TRANSFORMERS:
        # Fallback return a zero vector
        return np.zeros(384)
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity between two normalized vectors."""
    return float(np.dot(vec_a, vec_b))


def semantic_skill_match(candidate_skills: list[str], job_skills: list[str]) -> float:
    """
    Score how well a candidate's skills semantically match the job skills.
    Returns a score between 0 and 100.
    """
    if not candidate_skills or not job_skills:
        return 0.0

    if not HAS_SENTENCE_TRANSFORMERS:
        # Fallback implementation using string/token similarity
        cand_lower = {s.lower().strip() for s in candidate_skills}
        job_lower = {s.lower().strip() for s in job_skills}
        
        matches = 0
        for j_skill in job_lower:
            # Exact match
            if j_skill in cand_lower:
                matches += 1.0
                continue
            # Partial match
            best_partial = 0.0
            for c_skill in cand_lower:
                if j_skill in c_skill or c_skill in j_skill:
                    best_partial = max(best_partial, min(len(j_skill), len(c_skill)) / max(len(j_skill), len(c_skill)))
            matches += best_partial
            
        return round((matches / len(job_skills)) * 100, 2)

    model = get_model()
    job_vecs = model.encode(job_skills, normalize_embeddings=True)
    cand_vecs = model.encode(candidate_skills, normalize_embeddings=True)

    # For each job skill, find the best matching candidate skill
    match_scores = []
    for jv in job_vecs:
        sims = [float(np.dot(jv, cv)) for cv in cand_vecs]
        match_scores.append(max(sims))

    return round(np.mean(match_scores) * 100, 2)

