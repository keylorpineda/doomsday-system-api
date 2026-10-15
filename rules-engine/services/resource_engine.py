"""
Motor de Recursos — Sistema de Reglas Determinístico

Fórmula de proyección:
    días_restantes = stock / max(consumo_neto, 0.001)
    consumo_neto   = consumo_diario + (nuevas_personas × per_cápita) - producción_diaria

Constantes alineadas con el backend NestJS (DAILY_CONSUMPTION):
    agua  → 3.0 litros/persona/día
    comida → 2.0 kg/persona/día
"""

from typing import Dict, List


_PER_CAPITA: Dict[str, float] = {
    "water":  3.0,
    "food":   2.0,
    "medicine": 0.1,
    "fuel":   0.5,
    "tools":  0.0,
}

_ALERT_THRESHOLDS = [
    (7,  "CRÍTICO",    "❌"),
    (15, "GRAVE",      "🔴"),
    (30, "ADVERTENCIA","⚠️"),
    (60, "BAJO",       "🟡"),
]


class ResourceRuleEngine:
    """Motor determinístico de proyección y alerta de recursos."""

    def forecast(self, data: Dict) -> Dict:
        resource_type    = data.get("resource_type", "food")
        current_stock    = float(data.get("current_stock", 0))
        current_people   = int(data.get("current_people", 1))
        new_people       = int(data.get("new_people", 0))
        daily_production = float(data.get("daily_production", 0))
        daily_consumption = float(data.get("daily_consumption") or 0)

        per_capita = _PER_CAPITA.get(resource_type, 1.0)

        if daily_consumption == 0:
            daily_consumption = (current_people + new_people) * per_capita

        net_consumption = daily_consumption + (new_people * per_capita) - daily_production
        net_consumption = max(net_consumption, 0.001)

        days_remaining  = current_stock / net_consumption
        alert_level, alert_emoji = self._alert(days_remaining)

        forecast = self._forecast_table(
            current_stock, daily_production, daily_consumption, new_people, per_capita
        )

        recomendaciones = self._recommendations(
            resource_type, days_remaining, alert_level, new_people
        )

        report = self._build_report(
            resource_type, current_stock, days_remaining,
            alert_level, alert_emoji, net_consumption, forecast, recomendaciones
        )

        return {
            "resource_type":   resource_type,
            "days_remaining":  round(days_remaining, 1),
            "net_daily_consumption": round(net_consumption, 2),
            "alert_level":     alert_level,
            "alert_emoji":     alert_emoji,
            "forecast":        forecast,
            "recommendations": recomendaciones,
            "transparency_report": report,
        }

    def _alert(self, days: float):
        for threshold, label, emoji in _ALERT_THRESHOLDS:
            if days <= threshold:
                return label, emoji
        return "ESTABLE", "✅"

    def _forecast_table(
        self,
        stock: float,
        production: float,
        base_consumption: float,
        new_people: int,
        per_capita: float,
    ) -> List[Dict]:
        rows = []
        extra = new_people * per_capita
        for day in [7, 14, 30, 60]:
            produced  = production * day
            consumed  = (base_consumption + extra) * day
            remaining = max(stock + produced - consumed, 0)
            level, _  = self._alert(remaining / max((base_consumption + extra), 0.001))
            rows.append({
                "day":       day,
                "remaining": round(remaining, 1),
                "alert":     level,
            })
        return rows

    def _recommendations(
        self, rtype: str, days: float, level: str, new_people: int
    ) -> List[str]:
        recs = []
        if level == "CRÍTICO":
            recs.append(f"⛔ URGENTE: racionamiento de {rtype} inmediato.")
        elif level in ("GRAVE", "ADVERTENCIA"):
            recs.append(f"⚠️ Reducir consumo de {rtype} en al menos 20%.")
        if days < 30 and new_people > 0:
            recs.append(f"⚠️ Incorporar {new_people} persona(s) presionará el inventario.")
        if days > 60:
            recs.append(f"✅ Stock de {rtype} suficiente para las próximas semanas.")
        return recs or [f"✅ Nivel de {rtype} estable por ahora."]

    def _build_report(
        self, rtype, stock, days, level, emoji, net, forecast, recs
    ) -> str:
        lines = [
            "=" * 60,
            "  REPORTE DE PROYECCIÓN DE RECURSOS (Caja de Cristal)",
            "=" * 60,
            f"  Recurso          : {rtype.upper()}",
            f"  Stock actual     : {stock:.1f} unidades",
            f"  Consumo neto/día : {net:.2f} unidades",
            f"  Días restantes   : {days:.1f}",
            f"  Estado actual    : {emoji} {level}",
            "",
            "  PROYECCIÓN FUTURA:",
            "  Día  | Stock restante | Alerta",
            "  " + "-" * 40,
        ]
        for row in forecast:
            lines.append(f"  {row['day']:3d}d | {row['remaining']:13.1f} | {row['alert']}")
        lines += [
            "",
            "  RECOMENDACIONES:",
        ]
        for r in recs:
            lines.append(f"  • {r}")
        lines.append("=" * 60)
        return "\n".join(lines)
