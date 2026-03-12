"""
Router de Admisiones — Análisis NLP + Caja de Cristal

Endpoint:
    POST /api/admissions/nlp-analyze
"""

from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.admission_engine import AdmissionRuleEngine

router = APIRouter(prefix="/api/admissions", tags=["Admissions"])
_engine = AdmissionRuleEngine()


class NLPAnalysisRequest(BaseModel):
    first_name:            str
    last_name:             str
    age:                   int             = Field(ge=16, le=80)
    gender:                str             = "M"
    health_status:         float           = Field(default=50, ge=0, le=100)
    physical_condition:    float           = Field(default=50, ge=0, le=100)
    medical_conditions:    Optional[List[str]] = []
    skills:                List[str]       = []
    previous_profession:   Optional[str]   = None
    years_experience:      Optional[int]   = 0
    criminal_record:       bool            = False
    psychological_evaluation: Optional[str] = None
    photo_url:             Optional[str]   = None
    id_card_url:           Optional[str]   = None
    personal_history:      Optional[str]   = None


@router.post("/nlp-analyze")
def nlp_analyze(request: NLPAnalysisRequest):
    """
    Analiza un candidato con el motor de reglas de la Caja de Cristal.

    Devuelve:
    - score NLP (0–90)
    - porcentaje y decisión sugerida
    - infección detectada (boolean)
    - desglose de criterios (glass_box)
    - reporte de transparencia (texto ASCII)
    """
    return _engine.analyze(request.model_dump())
