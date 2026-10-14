"""
Motor de Admisión — Sistema de Reglas "Caja de Cristal" (Glass Box)

Cada criterio es VISIBLE, AUDITABLE y EXPLICABLE.
Requisito académico: demostrar CÓMO se tomó la decisión de forma transparente.

Criterios evaluados (máx 90 puntos):
  1. Riesgo Biológico / Infección    → 0 ó 20 pts
  2. Estado de Salud Física          → 2–15 pts
  3. Rango de Edad                   → 2–10 pts
  4. Habilidades y Profesión         → 0–10 pts
  5. Evaluación de Honestidad (NLP)  → 2–10 pts
  6. Antecedentes Penales            → 0 ó 10 pts
  7. Estado Psicológico (Trauma)     → 3–10 pts
  8. Documentación Multimodal        → 0–5 pts
"""

from dataclasses import dataclass
from typing import Dict, List

from .nlp_service import NLPService


@dataclass
class Criterion:
    name: str
    icon: str
    score: int
    max_score: int
    status: str
    detail: str
    evidence: List[str]

    @property
    def percentage(self) -> int:
        return round((self.score / self.max_score) * 100) if self.max_score else 0

    def to_dict(self) -> Dict:
        return {
            "name":      self.name,
            "icon":      self.icon,
            "score":     self.score,
            "max_score": self.max_score,
            "percentage": self.percentage,
            "status":    self.status,
            "detail":    self.detail,
            "evidence":  self.evidence,
        }


class AdmissionRuleEngine:
    """Motor de reglas determinístico para admisiones — sin ML, sin archivos .pkl."""

    MAX_SCORE = 90

    def __init__(self):
        self.nlp = NLPService()

    def analyze(self, candidate: Dict) -> Dict:
        personal_history = (
            candidate.get("personal_history") or
            candidate.get("reason_to_join") or ""
        )
        photo_url     = candidate.get("photo_url", "") or ""
        id_card_url   = candidate.get("id_card_url", "") or ""
        age           = int(candidate.get("age", 30))
        health_status = float(candidate.get("health_status", 50))
        physical      = float(candidate.get("physical_condition", 50))
        skills        = candidate.get("skills", []) or []
        years_exp     = int(candidate.get("years_experience", 0) or 0)
        criminal      = bool(candidate.get("criminal_record", False))
        medical_conds = candidate.get("medical_conditions", []) or []

        nlp = self.nlp.analyze_text(personal_history) if personal_history else self.nlp._empty_result()

        criteria: List[Criterion] = []

        # ── 1. Riesgo Biológico ────────────────────────────────────────────────
        inf_kws = nlp.get("infection_risk_keywords", [])
        has_contagious = any("contagious" in str(mc).lower() for mc in medical_conds)

        if inf_kws or has_contagious:
            evidence = inf_kws.copy()
            if has_contagious:
                evidence.append("condición médica contagiosa declarada")
            criteria.append(Criterion(
                name="Riesgo Biológico / Infección",
                icon="❌", score=0, max_score=20, status="CRÍTICO",
                detail=f"⚠️ Palabras de riesgo detectadas: {', '.join(evidence[:3])}. ALTO RIESGO BIOLÓGICO.",
                evidence=evidence,
            ))
        else:
            criteria.append(Criterion(
                name="Riesgo Biológico / Infección",
                icon="✅", score=20, max_score=20, status="ÓPTIMO",
                detail="Sin palabras clave de riesgo biológico ni condición contagiosa declarada.",
                evidence=[],
            ))

        # ── 2. Estado de Salud Física ──────────────────────────────────────────
        health_avg = (health_status + physical) / 2
        if health_avg >= 80:
            h_score, h_label, h_icon = 15, "ÓPTIMO", "✅"
            h_detail = f"Salud {int(health_status)}/100, Condición física {int(physical)}/100. Estado excelente."
        elif health_avg >= 55:
            h_score, h_label, h_icon = 8, "ACEPTABLE", "⚠️"
            h_detail = f"Salud {int(health_status)}/100, Condición física {int(physical)}/100. Estado moderado."
        else:
            h_score, h_label, h_icon = 2, "CRÍTICO", "❌"
            h_detail = f"Salud {int(health_status)}/100, Condición física {int(physical)}/100. Estado comprometido."

        criteria.append(Criterion(
            name="Estado de Salud Física",
            icon=h_icon, score=h_score, max_score=15, status=h_label,
            detail=h_detail, evidence=[],
        ))

        # ── 3. Rango de Edad ───────────────────────────────────────────────────
        if 20 <= age <= 50:
            a_score, a_label, a_icon = 10, "ÓPTIMO", "✅"
            a_detail = f"Edad {age}: Rango de máxima capacidad productiva (20–50 años)."
        elif (16 <= age < 20) or (50 < age <= 65):
            a_score, a_label, a_icon = 6, "ACEPTABLE", "⚠️"
            a_detail = f"Edad {age}: Fuera del rango óptimo pero con capacidad funcional."
        else:
            a_score, a_label, a_icon = 2, "LIMITADO", "⚠️"
            a_detail = f"Edad {age}: Capacidad productiva y física limitada."

        criteria.append(Criterion(
            name="Rango de Edad",
            icon=a_icon, score=a_score, max_score=10, status=a_label,
            detail=a_detail, evidence=[],
        ))

        # ── 4. Habilidades y Profesión ─────────────────────────────────────────
        nlp_skills = nlp.get("skills_detected", [])
        all_skills = list(set(list(skills) + nlp_skills))
        s_score = min(len(all_skills) * 3 + min(years_exp, 3), 10)
        s_icon  = "✅" if s_score >= 7 else "⚠️" if s_score >= 3 else "❌"
        s_label = "ALTO" if s_score >= 8 else "MEDIO" if s_score >= 4 else "BAJO"
        s_summary = ", ".join(all_skills[:5]) if all_skills else "ninguna detectada"

        criteria.append(Criterion(
            name="Habilidades y Profesión",
            icon=s_icon, score=s_score, max_score=10, status=s_label,
            detail=f"{len(skills)} habilidades declaradas + {len(nlp_skills)} detectadas en historial. Resumen: {s_summary}.",
            evidence=nlp_skills,
        ))

        # ── 5. Evaluación de Honestidad ────────────────────────────────────────
        deception    = nlp.get("deception_indicators", [])
        narrative_q  = nlp.get("narrative_quality", "BAJA")
        has_time     = nlp.get("has_time_references", False)
        has_loc      = nlp.get("has_location_references", False)
        coherence    = (1 if has_time else 0) + (1 if has_loc else 0)

        if not deception and narrative_q == "ALTA":
            hon_score = min(8 + coherence, 10)
            hon_icon, hon_label = "✅", "ALTA"
            hon_detail = f"Narrativa detallada ({nlp.get('word_count', 0)} palabras) y coherente. Sin indicadores de evasión."
        elif len(deception) <= 1 and narrative_q in ("ALTA", "MEDIA"):
            hon_score = min(5 + coherence, 10)
            hon_icon, hon_label = "⚠️", "MEDIA"
            hon_detail = f"Narrativa moderada ({nlp.get('word_count', 0)} palabras). Indicador: {', '.join(deception) or 'ninguno'}."
        else:
            hon_score = 2
            hon_icon, hon_label = "❌", "BAJA"
            hon_detail = f"Narrativa corta o evasiva ({nlp.get('word_count', 0)} palabras). Indicadores: {', '.join(deception[:3])}."

        criteria.append(Criterion(
            name="Evaluación de Honestidad (NLP)",
            icon=hon_icon, score=hon_score, max_score=10, status=hon_label,
            detail=hon_detail, evidence=deception,
        ))

        # ── 6. Antecedentes Penales ────────────────────────────────────────────
        if criminal:
            criteria.append(Criterion(
                name="Antecedentes Penales",
                icon="❌", score=0, max_score=10, status="ALERTA",
                detail="Antecedentes penales declarados. Requiere evaluación especial por administrador.",
                evidence=["antecedentes penales confirmados"],
            ))
        else:
            criteria.append(Criterion(
                name="Antecedentes Penales",
                icon="✅", score=10, max_score=10, status="LIMPIO",
                detail="Sin antecedentes penales declarados.",
                evidence=[],
            ))

        # ── 7. Estado Psicológico (Trauma) ────────────────────────────────────
        trauma_list = nlp.get("trauma_indicators", [])
        tc = len(trauma_list)
        if tc == 0:
            t_score, t_label, t_icon = 10, "ESTABLE", "✅"
            t_detail = "Sin indicadores de trauma severo detectados en la narrativa."
        elif tc == 1:
            t_score, t_label, t_icon = 6, "MODERADO", "⚠️"
            t_detail = f'1 indicador de trauma: "{trauma_list[0]}". Apoyo psicológico recomendado.'
        else:
            t_score, t_label, t_icon = 3, "ALTO", "⚠️"
            t_detail = f'{tc} indicadores de trauma: {", ".join(trauma_list[:2])}. Apoyo psicológico urgente.'

        criteria.append(Criterion(
            name="Estado Psicológico (Trauma)",
            icon=t_icon, score=t_score, max_score=10, status=t_label,
            detail=t_detail, evidence=trauma_list,
        ))

        # ── 8. Documentación Multimodal ────────────────────────────────────────
        has_photo = photo_url.startswith(("http", "/"))
        has_id    = id_card_url.startswith(("http", "/"))

        if has_photo and has_id:
            d_score, d_label, d_icon = 5, "COMPLETO", "✅"
            d_detail = "Fotografía e identificación proporcionadas. Documentación completa."
        elif has_photo or has_id:
            d_score, d_label, d_icon = 3, "PARCIAL", "⚠️"
            d_detail = f'Documentación parcial: Foto {"✅" if has_photo else "❌"} | ID {"✅" if has_id else "❌"}.'
        else:
            d_score, d_label, d_icon = 0, "FALTANTE", "❌"
            d_detail = "Sin fotografía ni identificación. Verificación manual requerida."

        criteria.append(Criterion(
            name="Documentación Multimodal",
            icon=d_icon, score=d_score, max_score=5, status=d_label,
            detail=d_detail,
            evidence=[
                f"foto: {'proporcionada' if has_photo else 'no proporcionada'}",
                f"identificación: {'proporcionada' if has_id else 'no proporcionada'}",
            ],
        ))

        # ── Score final y decisión ─────────────────────────────────────────────
        total = sum(c.score for c in criteria)
        pct   = round((total / self.MAX_SCORE) * 100)

        infection_detected = criteria[0].score == 0 and bool(inf_kws or has_contagious)

        if infection_detected:
            hint = "RECOMMEND_REJECT"
        elif pct >= 72:
            hint = "RECOMMEND_ACCEPT"
        elif pct >= 45:
            hint = "PENDING_HUMAN"
        else:
            hint = "RECOMMEND_REJECT"

        report = self._build_transparency_report(candidate, criteria, total, pct, hint, nlp)

        return {
            "nlp_score":          total,
            "nlp_max_score":      self.MAX_SCORE,
            "nlp_percentage":     pct,
            "nlp_decision_hint":  hint,
            "infection_detected": infection_detected,
            "glass_box": {
                "criteria":    [c.to_dict() for c in criteria],
                "total_score": total,
                "max_score":   self.MAX_SCORE,
                "percentage":  pct,
            },
            "nlp_analysis": {
                "detected_skills":      nlp.get("skills_detected", []),
                "risk_keywords":        nlp.get("infection_risk_keywords", []),
                "trauma_indicators":    nlp.get("trauma_indicators", []),
                "deception_indicators": nlp.get("deception_indicators", []),
                "narrative_quality":    nlp.get("narrative_quality", "N/A"),
                "word_count":           nlp.get("word_count", 0),
            },
            "document_status": {
                "photo_provided":    has_photo,
                "id_card_provided":  has_id,
                "is_complete":       has_photo and has_id,
            },
            "transparency_report": report,
        }

    def _build_transparency_report(
        self,
        candidate: Dict,
        criteria: List[Criterion],
        total: int,
        pct: int,
        hint: str,
        nlp: Dict,
    ) -> str:
        name = f"{candidate.get('first_name', '?')} {candidate.get('last_name', '?')}"
        hint_labels = {
            "RECOMMEND_ACCEPT": "✅  RECOMENDACIÓN IA: ACEPTAR",
            "PENDING_HUMAN":    "⚠️  RECOMENDACIÓN IA: REVISIÓN HUMANA REQUERIDA",
            "RECOMMEND_REJECT": "❌  RECOMENDACIÓN IA: RECHAZAR",
        }
        sep  = "=" * 64
        thin = "-" * 64

        lines = [
            sep,
            "   ANÁLISIS IA — REPORTE DE TRANSPARENCIA (CAJA DE CRISTAL)",
            sep,
            f"   Candidato  : {name}",
            f"   Score NLP  : {total}/{self.MAX_SCORE} ({pct}%)",
            f"   {hint_labels.get(hint, hint)}",
            sep,
            "",
            "CRITERIOS EVALUADOS (cada criterio es auditable y trazable):",
            thin,
        ]

        for c in criteria:
            filled = round(c.percentage / 10)
            bar = "█" * filled + "░" * (10 - filled)
            lines.append(f"  {c.icon} {c.name:<40} [{c.score:2d}/{c.max_score:2d}] [{bar}]")
            lines.append(f"       → {c.detail}")
            if c.evidence:
                ev_str = ", ".join(str(e) for e in c.evidence[:3])
                lines.append(f"       → Evidencia: {ev_str}")
            lines.append("")

        lines += [
            thin,
            "RESUMEN ANÁLISIS DE TEXTO (NLP — spaCy es_core_news_sm):",
        ]

        wc      = nlp.get("word_count", 0)
        quality = nlp.get("narrative_quality", "N/A")
        skills  = nlp.get("skills_detected", [])
        risks   = nlp.get("infection_risk_keywords", [])
        trauma  = nlp.get("trauma_indicators", [])

        lines.append(f"   📝 Calidad narrativa   : {quality} ({wc} palabras)")
        if skills:
            lines.append(f"   ✅ Habilidades en texto: {', '.join(skills)}")
        if risks:
            lines.append(f"   ❌ Palabras de riesgo  : {', '.join(risks)}")
        if trauma:
            lines.append(f"   ⚠️  Indicadores trauma  : {', '.join(trauma[:3])}")

        lines += [
            "",
            thin,
            "NOTA LEGAL / ACADÉMICA:",
            "   Esta evaluación es generada por un sistema de reglas determinísticas",
            "   (Inteligencia Artificial No Generativa). La decisión FINAL siempre",
            "   corresponde al administrador humano del campamento (Human-in-the-Loop).",
            "   Todos los criterios son auditables, trazables y reproducibles.",
            sep,
        ]

        return "\n".join(lines)
