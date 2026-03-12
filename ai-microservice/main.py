"""
Microservicio IA — Inteligencia Artificial No Generativa
Sistema de Reglas Determinísticas ("Caja de Cristal")

Puerto por defecto: 8000
NestJS backend: http://localhost:3000

Iniciar:
    uvicorn main:app --reload --port 8000

Instalar modelo spaCy (solo 1ª vez):
    python -m spacy download es_core_news_sm
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import admissions, resources, expeditions, events

settings = get_settings()

app = FastAPI(
    title="IA No Generativa — Sistema de Reglas (Caja de Cristal)",
    description=(
        "Microservicio de Inteligencia Artificial Determinística para\n"
        "gestión de campamentos post-apocalípticos.\n\n"
        "**Sin ML. Sin entrenamiento. Sin archivos .pkl.**\n"
        "Todas las decisiones son 100% auditables y trazables."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admissions.router)
app.include_router(resources.router)
app.include_router(expeditions.router)
app.include_router(events.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Verifica que el microservicio IA esté activo y spaCy cargado."""
    try:
        import spacy
        try:
            spacy.load("es_core_news_sm")
            spacy_status = "ok"
            spacy_model  = "es_core_news_sm ✅"
        except OSError:
            spacy_status = "model_missing"
            spacy_model  = "es_core_news_sm ❌ — ejecuta: python -m spacy download es_core_news_sm"
    except ImportError:
        spacy_status = "not_installed"
        spacy_model  = "spaCy no instalado"

    return {
        "status":       "ok",
        "service":      "AI Non-Generative Rule Engine",
        "version":      "1.0.0",
        "paradigm":     "Glass Box (Caja de Cristal) — Deterministic Rules",
        "spacy_status": spacy_status,
        "spacy_model":  spacy_model,
        "endpoints": {
            "admissions_analyze":  "POST /api/admissions/nlp-analyze",
            "resources_forecast":  "POST /api/resources/forecast",
            "expeditions_analyze": "POST /api/expeditions/analyze",
            "events_generate":     "POST /api/events/generate",
        },
    }
