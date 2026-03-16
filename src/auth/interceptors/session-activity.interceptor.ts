import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session } from "../entities/session.entity";
import { JwtService } from "@nestjs/jwt";

/**
 * Interceptor que actualiza last_activity en cada request autenticado
 * Esto permite trackear la actividad del usuario para logout autom�tico por inactividad
 */
@Injectable()
export class SessionActivityInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly jwtService: JwtService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Solo actualizar si hay token de autenticaci�n
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;

        // Actualizar last_activity de todas las sesiones activas del usuario
        await this.sessionRepo.update(
          { user_id: userId, is_active: true },
          { last_activity: new Date() },
        );
      } catch (error) {
        // Token inv�lido o expirado - no hacer nada, el guard JWT manejar� esto
      }
    }

    return next.handle().pipe(
      tap(() => {
        // Aqu� podr�amos agregar logs si fuera necesario
      }),
    );
  }
}
