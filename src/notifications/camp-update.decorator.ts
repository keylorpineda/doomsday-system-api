import { SetMetadata } from "@nestjs/common";

/** Áreas de datos de un campamento que los clientes pueden volver a consultar. */
export type CampUpdateTopic =
  | "admissions"
  | "explorations"
  | "inventory"
  | "persons"
  | "transfers";

export const CAMP_UPDATE_TOPIC = "camp_update_topic";

/**
 * Marca un endpoint que modifica datos de un campamento. Cuando responde con
 * éxito, `CampUpdateInterceptor` emite `camp.updated` por WebSocket a la sala
 * de cada campamento afectado, para que los clientes refresquen sólo ese tema
 * en lugar de consultar todo periódicamente. Acepta varios temas cuando una
 * operación afecta más de un área (p. ej. la llegada de un traslado).
 */
export const EmitCampUpdate = (...topics: CampUpdateTopic[]) =>
  SetMetadata(CAMP_UPDATE_TOPIC, topics);
