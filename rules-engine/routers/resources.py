"""
Router de Recursos — Proyección de inventario

Endpoint:
    POST /api/resources/forecast
"""

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.resource_engine import ResourceRuleEngine

router = APIRouter(prefix="/api/resources", tags=["Resources"])
_engine = ResourceRuleEngine()


class ResourceForecastRequest(BaseModel):
    resource_type:     str   = Field(default="food", description="water|food|medicine|fuel|tools")
    current_stock:     float = Field(ge=0)
    current_people:    int   = Field(ge=1)
    new_people:        int   = Field(default=0, ge=0)
    daily_production:  float = Field(default=0, ge=0)
    daily_consumption: Optional[float] = None


@router.post("/forecast")
def forecast_resource(request: ResourceForecastRequest):
    """
    Proyecta el consumo de un recurso y genera alertas.

    Devuelve:
    - días restantes
    - nivel de alerta (CRÍTICO / GRAVE / ADVERTENCIA / BAJO / ESTABLE)
    - tabla de proyección a 7, 14, 30, 60 días
    - recomendaciones
    - reporte de transparencia
    """
    return _engine.forecast(request.model_dump())
