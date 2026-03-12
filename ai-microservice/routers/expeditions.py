"""
Router de Expediciones — Análisis de probabilidad de éxito

Endpoint:
    POST /api/expeditions/analyze
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.expedition_engine import ExpeditionRuleEngine

router = APIRouter(prefix="/api/expeditions", tags=["Expeditions"])
_engine = ExpeditionRuleEngine()


class ExpeditionAnalysisRequest(BaseModel):
    objective:       str   = "exploración"
    difficulty:      int   = Field(default=3, ge=1, le=5)
    group_size:      int   = Field(default=1, ge=1)
    leaders:         int   = Field(default=0, ge=0)
    avg_experience:  float = Field(default=0.0, ge=0.0, le=5.0)
    duration_days:   int   = Field(default=1, ge=1)
    avg_health:      float = Field(default=75.0, ge=0, le=100)


@router.post("/analyze")
def analyze_expedition(request: ExpeditionAnalysisRequest):
    """
    Evalúa la viabilidad de una expedición.

    Devuelve:
    - probabilidad de éxito (0–95%)
    - nivel de riesgo (BAJO / MEDIO / ALTO / CRÍTICO)
    - factores con ajuste positivo/negativo (transparencia)
    - sugerencias para mejorar probabilidad
    - reporte de transparencia ASCII
    """
    return _engine.analyze(request.model_dump())
