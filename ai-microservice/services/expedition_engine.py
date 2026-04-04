"""
Motor de Expediciones — Sistema de Reglas Determinístico

Probabilidad de éxito (0–100):
    base = 100
    - difficulty × 10         (dificultad 1–5 → hasta -50)
    - líderes: 0 → -25, 1 → -5, 2+ → 0
    + experiencia.promedio × 4 (experiencia 0–5 → hasta +20)
    - duración: >7d → -15, >3d → -5
    - salud promedio: <50 → -15
    - tamaño grupo: <2 → -20
    Límite: min(95, max(5, total))
"""

from typing import Dict, List


_RISK_BY_DIFF = {
    1: "BAJO",
    2: "BAJO",
    3: "MEDIO",
    4: "ALTO",
    5: "CRÍTICO",
}


class ExpeditionRuleEngine:
    """Motor determinístico para análisis de expediciones."""

    def analyze(self, data: Dict) -> Dict:
        difficulty    = max(1, min(5, int(data.get("difficulty", 3))))
        group_size    = int(data.get("group_size", 1))
        leaders       = int(data.get("leaders", 0))
        avg_experience = float(data.get("avg_experience", 0))
        duration_days = int(data.get("duration_days", 1))
        avg_health    = float(data.get("avg_health", 75))
        objective     = data.get("objective", "exploración")

        adjustments: List[Dict] = []
        score = 100

        # Dificultad
        diff_penalty = difficulty * 10
        score -= diff_penalty
        adjustments.append({"factor": f"Dificultad nivel {difficulty}", "adjustment": -diff_penalty, "reason": "Mayor dificultad reduce probabilidad base"})

        # Líderes
        if leaders == 0:
            score -= 25
            adjustments.append({"factor": "Sin líderes", "adjustment": -25, "reason": "Sin liderazgo la expedición tiene alto riesgo de desorganización"})
        elif leaders == 1:
            score -= 5
            adjustments.append({"factor": "1 líder", "adjustment": -5, "reason": "Liderazgo mínimo. Se recomienda 2+ líderes"})
        else:
            adjustments.append({"factor": f"{leaders} líderes", "adjustment": 0, "reason": "Liderazgo adecuado"})

        # Experiencia
        exp_bonus = min(20, round(avg_experience * 4))
        score += exp_bonus
        adjustments.append({"factor": f"Experiencia promedio {avg_experience:.1f}/5", "adjustment": exp_bonus, "reason": "Experiencia del equipo mejora rendimiento"})

        # Duración
        if duration_days > 7:
            score -= 15
            adjustments.append({"factor": f"Duración {duration_days} días (>7)", "adjustment": -15, "reason": "Expediciones largas aumentan riesgo de imprevistos"})
        elif duration_days > 3:
            score -= 5
            adjustments.append({"factor": f"Duración {duration_days} días (>3)", "adjustment": -5, "reason": "Duración moderada con riesgo aceptable"})
        else:
            adjustments.append({"factor": f"Duración {duration_days} días", "adjustment": 0, "reason": "Duración corta, riesgo mínimo"})

        # Salud
        if avg_health < 50:
            score -= 15
            adjustments.append({"factor": f"Salud promedio {avg_health:.0f}%", "adjustment": -15, "reason": "Equipo con salud comprometida no es apto para expedición"})
        else:
            adjustments.append({"factor": f"Salud promedio {avg_health:.0f}%", "adjustment": 0, "reason": "Salud del equipo aceptable"})

        # Tamaño
        if group_size < 2:
            score -= 20
            adjustments.append({"factor": f"Grupo de {group_size} persona(s)", "adjustment": -20, "reason": "Expedición solitaria es extremadamente peligrosa"})
        else:
            adjustments.append({"factor": f"Grupo de {group_size} personas", "adjustment": 0, "reason": "Tamaño de grupo adecuado"})

        probability   = min(95, max(5, score))
        risk_level    = _RISK_BY_DIFF.get(difficulty, "MEDIO")
        suggestions   = self._suggestions(probability, leaders, avg_health, group_size, duration_days)
        report        = self._build_report(objective, probability, risk_level, adjustments, suggestions)

        return {
            "success_probability": probability,
            "risk_level":    risk_level,
            "adjustments":   adjustments,
            "suggestions":   suggestions,
            "transparency_report": report,
        }

    def _suggestions(
        self, prob: int, leaders: int, health: float, size: int, days: int
    ) -> List[str]:
        tips = []
        if prob < 40:
            tips.append("⛔ Probabilidad muy baja. Reconsidere la expedición o aumente preparación.")
        if leaders == 0:
            tips.append("⚠️ Asigne al menos 1 líder experimentado antes de partir.")
        if health < 60:
            tips.append(f"⚠️ Salud promedio del equipo ({health:.0f}%) es insuficiente.")
        if size < 3:
            tips.append("⚠️ Se recomienda un mínimo de 3 personas para seguridad.")
        if days > 5:
            tips.append("📦 Expedición larga: asegure suministros dobles.")
        if prob >= 70:
            tips.append("✅ La expedición tiene probabilidades razonables de éxito.")
        return tips or ["✅ Sin observaciones críticas."]

    def _build_report(
        self, objective: str, prob: int, risk: str, adjustments: List[Dict], suggestions: List[str]
    ) -> str:
        bar_len = max(1, round(prob / 5))
        bar = "█" * bar_len + "░" * (20 - bar_len)
        lines = [
            "=" * 60,
            "  ANÁLISIS DE EXPEDICIÓN (Caja de Cristal)",
            "=" * 60,
            f"  Objetivo          : {objective}",
            f"  Prob. de éxito    : {prob}% [{bar}]",
            f"  Nivel de riesgo   : {risk}",
            "",
            "  FACTORES EVALUADOS:",
            "  " + "-" * 56,
        ]
        for adj in adjustments:
            sign = "+" if adj["adjustment"] >= 0 else ""
            lines.append(f"  {adj['factor']:<35} {sign}{adj['adjustment']:3d} pts")
            lines.append(f"    → {adj['reason']}")
        lines += ["", "  SUGERENCIAS:"]
        for s in suggestions:
            lines.append(f"  • {s}")
        lines.append("=" * 60)
        return "\n".join(lines)
