"""
Router de Eventos — Generación de agenda diaria del campamento

Endpoint:
    POST /api/events/generate
"""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.events_engine import EventsRuleEngine

router = APIRouter(prefix="/api/events", tags=["Events"])
_engine = EventsRuleEngine()


class EventsRequest(BaseModel):
    camp_id:                str
    water_days_remaining:   float = Field(default=30, ge=0)
    food_days_remaining:    float = Field(default=30, ge=0)
    occupancy_percentage:   float = Field(default=50, ge=0, le=100)
    day_of_week:            int   = Field(default=0, ge=0, le=6, description="0=lunes…6=domingo")
    current_date:           Optional[str] = ""


@router.post("/generate")
def generate_events(request: EventsRequest):
    """
    Genera la agenda de eventos del día para un campamento.

    Devuelve:
    - lista de eventos (rutina, semanales, alertas)
    - conteo de urgentes
    - reporte de transparencia ASCII
    """
    return _engine.generate(request.model_dump())
