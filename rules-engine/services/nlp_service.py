"""
NLP Service — Analiza texto del candidato con spaCy (pre-entrenado) + keywords determinísticos.
SIN entrenamiento propio. SIN archivos .pkl. Funciona desde el día 1.
"""

import re
from typing import Dict, List

# ===========================================================================
# CONSTANTES DE REGLAS — Determinísticas, auditables, modificables aquí
# ===========================================================================

INFECTION_KEYWORDS: List[str] = [
    "mordida", "mordido", "me mordió", "me mordio", "me mordieron",
    "fiebre alta", "fiebre", "infectado", "infectada", "infección", "infeccion",
    "síntomas", "sintomas", "síntoma", "sintoma", "contagio", "contagiado", "contagiada",
    "herida zombie", "arañazo zombie", "me arañó", "me aranó", "me araño",
    "me atacó zombie", "virus desconocido", "enfermedad contagiosa",
    "escupió", "escupio", "sangre zombie", "me picó", "me pico",
]

DECEPTION_PATTERNS: List[str] = [
    r"\bno s[eé]\b",
    r"\bno recuerdo\b",
    r"\bno me acuerdo\b",
    r"\bme trajeron\b",
    r"\bme llevaron\b",
    r"\bno tengo idea\b",
    r"\bno estoy seguro\b",
    r"\bno estoy segura\b",
    r"\btal vez\b",
    r"\bquiz[aá]s\b",
    r"\bno s[eé] bien\b",
]

TRAUMA_KEYWORDS: List[str] = [
    "perdí todo", "perdi todo", "lo perdí todo", "lo perdi todo",
    "murió mi familia", "murio mi familia", "familia muerta",
    "vi morir", "los vi morir", "estaban muertos",
    "no tengo a nadie", "sobreviví solo", "sorevivi solo",
    "no puedo dormir", "pesadillas", "no quiero recordar",
    "lo vi todo", "fue horrible", "nunca voy a olvidar",
]

# Mapeo: clave interna → profesión real del backend + keywords de detección
SKILL_KEYWORD_MAP: Dict[str, List[str]] = {
    "Médico":       ["médico", "medico", "médica", "medica", "doctor", "doctora",
                     "enfermero", "enfermera", "cirujano", "cirugía", "cirugia",
                     "paramédico", "paramedico", "pediatra", "farmacéutico"],
    "Guardia":      ["armas", "soldado", "militar", "guardia", "policía", "policia",
                     "defensa", "ejército", "ejercito", "fuerzas armadas", "tirador"],
    "Agricultor":   ["agricultor", "agricultura", "cultivo", "granja", "cosecha",
                     "sembrar", "siembra", "cultivar", "cosechar", "jardinero"],
    "Ingeniero":    ["ingeniero", "ingeniería", "ingenieria", "mecánico", "mecanico",
                     "electricista", "construcción", "construccion", "técnico", "tecnico"],
    "Cocinero":     ["cocinero", "cocinera", "cocina", "chef", "gastronomía", "gastronomia"],
    "Aguatero":     ["agua", "plomero", "fontanero", "purificación", "purificacion",
                     "acueducto", "hidráulico", "hidraulico"],
    "Explorador":   ["explorador", "exploradora", "supervivencia", "navegación",
                     "navegacion", "orientación", "rastreo", "scout"],
    "Almacenista":  ["inventario", "almacén", "almacen", "logística", "logistica",
                     "bodega", "contabilidad", "administración"],
    "Constructor":  ["constructor", "constructora", "carpintero", "albañil", "albanil",
                     "mampostería", "mamposteria", "obras"],
    "Recolector":   ["recolector", "recolección", "recoleccion", "cazador", "caza",
                     "pesca", "pescador"],
}


class NLPService:
    """
    Motor NLP basado en keywords determinísticos + spaCy (español, pre-entrenado).
    La lógica de reglas NO cambia sin editar este archivo.
    """

    def __init__(self):
        self._nlp = None

    @property
    def nlp(self):
        """Lazy-load del modelo spaCy — se carga sólo si es necesario."""
        if self._nlp is None:
            try:
                import spacy
                self._nlp = spacy.load("es_core_news_sm")
            except Exception:
                self._nlp = False
        return self._nlp if self._nlp is not False else None

    def analyze_text(self, text: str) -> Dict:
        """
        Analiza texto libre del candidato.
        Retorna indicadores estructurados sin ningún modelo ML entrenado propio.
        """
        if not text or not text.strip():
            return self._empty_result()

        text_lower = text.lower()

        # 1. Riesgo de infección
        infection_found = [k for k in INFECTION_KEYWORDS if k in text_lower]

        # 2. Indicadores de engaño (regex)
        deception_found: List[str] = []
        for pattern in DECEPTION_PATTERNS:
            match = re.search(pattern, text_lower)
            if match:
                deception_found.append(match.group(0).strip())

        word_count = len(text.split())
        if word_count < 8:
            deception_found.append("narrativa muy corta (<8 palabras)")

        # 3. Indicadores de trauma
        trauma_found = [k for k in TRAUMA_KEYWORDS if k in text_lower]

        # 4. Habilidades detectadas por keyword
        skills_detected: List[str] = []
        for profession, keywords in SKILL_KEYWORD_MAP.items():
            if any(kw in text_lower for kw in keywords):
                skills_detected.append(profession)

        # 5. Calidad narrativa por longitud
        if word_count >= 40:
            narrative_quality = "ALTA"
        elif word_count >= 15:
            narrative_quality = "MEDIA"
        else:
            narrative_quality = "BAJA"

        # 6. Coherencia básica (referencias de tiempo / lugar)
        has_time_ref = bool(re.search(
            r"\b(antes|cuando|despu[eé]s|hace|durante|ahora|anteriormente|ayer|semana|meses|a[ñn]os)\b",
            text_lower
        ))
        has_location_ref = bool(re.search(
            r"\b(ciudad|pueblo|norte|sur|capital|zona|refugio|hospital|trabajo|calle|casa|barrio|pa[ií]s)\b",
            text_lower
        ))

        return {
            "infection_risk_keywords": list(set(infection_found)),
            "deception_indicators":    list(set(deception_found)),
            "trauma_indicators":       list(set(trauma_found)),
            "skills_detected":         skills_detected,
            "narrative_quality":       narrative_quality,
            "word_count":              word_count,
            "has_time_references":     has_time_ref,
            "has_location_references": has_location_ref,
        }

    def _empty_result(self) -> Dict:
        return {
            "infection_risk_keywords": [],
            "deception_indicators":    ["sin historial personal proporcionado"],
            "trauma_indicators":       [],
            "skills_detected":         [],
            "narrative_quality":       "BAJA",
            "word_count":              0,
            "has_time_references":     False,
            "has_location_references": False,
        }
