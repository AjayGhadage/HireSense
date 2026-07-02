from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import parse, rank, chat, questions

app = FastAPI(
    title="HireSense AI Service",
    description="Resume parsing, semantic ranking, and recruiter AI assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router)
app.include_router(rank.router)
app.include_router(chat.router)
app.include_router(questions.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "HireSense AI Service"}
