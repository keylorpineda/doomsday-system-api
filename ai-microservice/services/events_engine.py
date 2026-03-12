"""
Motor de Eventos — Sistema de Reglas Determinístico

Tipos de evento:
  - Fijos: actividades de rutina por hora (diana, almuerzo, reunión)
  - Alerta: basados en estado del campamento (agua, comida, ocupación)
  - Periódicos: basados en día de la semana (determinístico, no aleatorio)
"""

from typing import Dict, List


_FIXED_EVENTS = [
    {"time": "06:00", "type": "RUTINA",  "title": "Diana matutina",      "icon": "🌅", "priority": "BAJA",  "description": "Revisión matutina de todos los sectores del campamento."},
    {"time": "08:00", "type": "RUTINA",  "title": "Desayuno",            "icon": "🍽️", "priority": "MEDIA", "description": "Distribución del desayuno en el sector de comedor."},
    {"time": "12:00", "type": "RUTINA",  "title": "Almuerzo",            "icon": "🍽️", "priority": "MEDIA", "description": "Almuerzo principal del campamento."},
    {"time": "16:00", "type": "RUTINA",  "title": "Ronda de seguridad",  "icon": "🛡️", "priority": "ALTA",  "description": "Patrullaje perimetral obligatorio."},
    {"time": "18:00", "type": "RUTINA",  "title": "Cena",                "icon": "🍽️", "priority": "MEDIA", "description": "Distribución de la cena."},
    {"time": "20:00", "type": "RUTINA",  "title": "Reunión de asamblea", "icon": "📋", "priority": "ALTA",  "description": "Reunión general de líderes del campamento."},
    {"time": "22:00", "type": "RUTINA",  "title": "Toque de queda",      "icon": "🌙", "priority": "ALTA",  "description": "Cierre nocturno de instalaciones. Solo guardias en servicio."},
]

_DAY_EVENTS: Dict[int, List[Dict]] = {
    0: [{"time": "09:00", "type": "MANTENIMIENTO", "title": "Mantenimiento de instalaciones", "icon": "🔧", "priority": "MEDIA", "description": "Revisión semanal del sistema de agua, energía y cercas."}],
    2: [{"time": "10:00", "type": "ENTRENAMIENTO", "title": "Entrenamiento de defensa",       "icon": "⚔️", "priority": "ALTA",  "description": "Entrenamiento semanal de combate y primeros auxilios."}],
    4: [{"time": "09:00", "type": "ABASTECIMIENTO", "title": "Revisión de inventario",        "icon": "📦", "priority": "ALTA",  "description": "Conteo y verificación de todos los recursos del almacén."}],
    6: [{"time": "11:00", "type": "DESCANSO",       "title": "Día de descanso comunitario",   "icon": "🎮", "priority": "BAJA",  "description": "Actividades recreativas para mantener la moral del campamento."}],
}


class EventsRuleEngine:
    """Motor determinístico de generación de eventos del campamento."""

    def generate(self, data: Dict) -> Dict:
        camp_id       = data.get("camp_id", "")
        water_days    = float(data.get("water_days_remaining", 99))
        food_days     = float(data.get("food_days_remaining", 99))
        occupancy_pct = float(data.get("occupancy_percentage", 0))
        day_of_week   = int(data.get("day_of_week", 0))   # 0=lunes … 6=domingo
        current_date  = data.get("current_date", "")

        events: List[Dict] = []

        # ── Rutina diaria ──────────────────────────────────────────────────────
        for ev in _FIXED_EVENTS:
            events.append({**ev, "source": "FIJO", "camp_id": camp_id})

        # ── Eventos de día de semana ───────────────────────────────────────────
        for ev in _DAY_EVENTS.get(day_of_week, []):
            events.append({**ev, "source": "SEMANAL", "camp_id": camp_id})

        # ── Eventos de alerta (basados en estado del campamento) ───────────────
        alerts = []

        if water_days < 7:
            alerts.append({
                "time": "07:00", "type": "ALERTA", "icon": "💧", "priority": "URGENTE",
                "title": "ALERTA: Agua crítica",
                "description": f"Solo quedan {water_days:.1f} días de agua. Activar protocolo de racionamiento.",
                "source": "ALERTA_RECURSOS",
            })
        elif water_days < 15:
            alerts.append({
                "time": "07:00", "type": "ADVERTENCIA", "icon": "💧", "priority": "ALTA",
                "title": "Nivel de agua bajo",
                "description": f"Quedan {water_days:.1f} días de agua. Iniciar búsqueda de nueva fuente.",
                "source": "ALERTA_RECURSOS",
            })

        if food_days < 7:
            alerts.append({
                "time": "07:30", "type": "ALERTA", "icon": "🥫", "priority": "URGENTE",
                "title": "ALERTA: Comida crítica",
                "description": f"Solo quedan {food_days:.1f} días de comida. Activar protocolo de racionamiento.",
                "source": "ALERTA_RECURSOS",
            })
        elif food_days < 15:
            alerts.append({
                "time": "07:30", "type": "ADVERTENCIA", "icon": "🥫", "priority": "ALTA",
                "title": "Nivel de comida bajo",
                "description": f"Quedan {food_days:.1f} días de comida. Planificar expedición de reabastecimiento.",
                "source": "ALERTA_RECURSOS",
            })

        if occupancy_pct >= 95:
            alerts.append({
                "time": "08:30", "type": "ALERTA", "icon": "🏕️", "priority": "URGENTE",
                "title": "ALERTA: Campamento al límite",
                "description": f"Ocupación al {occupancy_pct:.0f}%. Suspender admisiones temporalmente.",
                "source": "ALERTA_CAPACIDAD",
            })
        elif occupancy_pct >= 80:
            alerts.append({
                "time": "08:30", "type": "ADVERTENCIA", "icon": "🏕️", "priority": "ALTA",
                "title": "Campamento casi lleno",
                "description": f"Ocupación al {occupancy_pct:.0f}%. Evaluar expansión o limitar admisiones.",
                "source": "ALERTA_CAPACIDAD",
            })

        events = alerts + events

        events.sort(key=lambda e: e["time"])

        urgentes = [e for e in events if e.get("priority") == "URGENTE"]

        return {
            "camp_id":       camp_id,
            "date":          current_date,
            "total_events":  len(events),
            "urgent_count":  len(urgentes),
            "events":        events,
            "transparency_report": self._build_report(events, urgentes, camp_id),
        }

    def _build_report(self, events: List, urgentes: List, camp_id: str) -> str:
        lines = [
            "=" * 60,
            "  AGENDA DEL CAMPAMENTO (Caja de Cristal)",
            "=" * 60,
        ]
        if urgentes:
            lines.append("  ⚠️  ALERTAS URGENTES:")
            for e in urgentes:
                lines.append(f"    {e['icon']} [{e['time']}] {e['title']}")
                lines.append(f"      → {e['description']}")
            lines.append("")

        lines.append("  EVENTOS DEL DÍA:")
        for e in events:
            if e.get("priority") != "URGENTE":
                lines.append(f"    {e['icon']} [{e['time']}] {e['title']}")
        lines.append("=" * 60)
        return "\n".join(lines)
