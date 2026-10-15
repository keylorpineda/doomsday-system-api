import { Injectable, Logger } from "@nestjs/common";
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Observable } from "rxjs";
import { tap } from "rxjs";

import { CAMP_UPDATE_TOPIC } from "./camp-update.decorator";
import type { CampUpdateTopic } from "./camp-update.decorator";
import { NotificationsGateway } from "./notifications.gateway";

/** Campos que identifican un campamento en params, body o respuesta. */
const CAMP_FIELDS = [
  "campId",
  "camp_id",
  "camp_origin_id",
  "camp_destination_id",
] as const;

type Bag = Record<string, unknown> | null | undefined;

function collectCampIds(source: Bag, into: Set<number>) {
  if (!source || typeof source !== "object") return;
  for (const field of CAMP_FIELDS) {
    const value = Number(source[field]);
    if (Number.isInteger(value) && value > 0) into.add(value);
  }
  // Entidades anidadas habituales (p. ej. una persona dentro de una asignación)
  const person = source.person as Bag;
  if (person && typeof person === "object") collectCampIds(person, into);
}

/**
 * Tras una mutación exitosa en un endpoint marcado con `@EmitCampUpdate`,
 * avisa por WebSocket a cada campamento afectado. Los ids se toman de los
 * parámetros de ruta, del body, de la respuesta y del usuario autenticado.
 * Un fallo al notificar nunca rompe la respuesta HTTP.
 */
@Injectable()
export class CampUpdateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CampUpdateInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly gateway: NotificationsGateway,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const topics = this.reflector.get<CampUpdateTopic[] | undefined>(
      CAMP_UPDATE_TOPIC,
      context.getHandler(),
    );
    if (!topics?.length || context.getType() !== "http") return next.handle();

    const request = context.switchToHttp().getRequest<{
      params?: Bag;
      body?: Bag;
      user?: Bag;
    }>();

    return next.handle().pipe(
      tap((response: unknown) => {
        try {
          const campIds = new Set<number>();
          collectCampIds(request.params, campIds);
          collectCampIds(request.body, campIds);
          collectCampIds(request.user, campIds);
          const payload = response as Bag;
          collectCampIds(payload, campIds);
          collectCampIds(payload?.data as Bag, campIds);
          campIds.forEach((campId) =>
            topics.forEach((topic) =>
              this.gateway.emitCampUpdated(campId, topic),
            ),
          );
        } catch (error) {
          this.logger.warn(
            `No se pudo notificar ${topics.join(", ")}: ${(error as Error).message}`,
          );
        }
      }),
    );
  }
}
