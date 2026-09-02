"""HTTP interface for the MGC grounded document assistant."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from assistant import answer_question

app = FastAPI(
    title="MGC Grounded Document Assistant API",
    version="0.1.0",
    description="Answers MGC document questions with sources and conservative fallback behaviour.",
)


class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)


class AnswerResponse(BaseModel):
    answer: str
    status: str
    sources: list[str]
    calculation: str | None = None


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ask", response_model=AnswerResponse)
def ask_question(payload: QuestionRequest) -> AnswerResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    try:
        return AnswerResponse(**answer_question(question))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Document assistant is unavailable. Run the ingestion step if this is "
                "the first start, then restart the document-assistant API."
            ),
        ) from exc
