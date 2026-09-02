from __future__ import annotations

import json
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException

from .features import prepare_features, single_lead_frame
from .schemas import LeadScoreRequest, LeadScoreResponse

ARTIFACT_DIR = Path(__file__).resolve().parents[2] / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "model.joblib"
METADATA_PATH = ARTIFACT_DIR / "metadata.json"

app = FastAPI(
    title="MGC Lead Scoring API",
    version="0.1.0",
    description="Intake-time conversion scoring using the best evaluated baseline candidate.",
)


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError(
            "Model artifact not found. Run: python -m mgc_lead_scoring.train "
            "--data ../../data/leads.csv"
        )
    return joblib.load(MODEL_PATH)


MODEL = load_model()
METADATA = (
    json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    if METADATA_PATH.exists()
    else {}
)


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model": METADATA.get("model", "unknown"),
        "average_precision": METADATA.get("metric_value"),
    }


@app.post("/score", response_model=LeadScoreResponse)
def score_lead(payload: LeadScoreRequest) -> LeadScoreResponse:
    try:
        raw = single_lead_frame(payload.model_dump(mode="json"))
        features = prepare_features(raw)
        probability = float(MODEL.predict_proba(features)[0, 1])
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not score lead: {exc}") from exc

    return LeadScoreResponse(
        conversion_probability=probability,
        score_percent=round(probability * 100, 1),
        model=str(METADATA.get("model", "unknown")),
        note="Use this estimate to prioritize sales follow-up.",
    )
