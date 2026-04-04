import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Session } from "../entities/session.entity";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos

/**
 * Guard que valida si la sesi�n ha estado inactiva por m�s de 20 minutos
 * Si detecta inactividad, marca auto_logout y rechaza el request
 */
@Injectable()
export class SessionInactivityGuard implements CanActivate {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es p�blica
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Sin token - dejamos que JwtAuthGuard maneje esto
      return true;
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Buscar sesiones activas del usuario
      const sessions = await this.sessionRepo.find({
        where: { user_id: userId, is_active: true },
        order: { last_activity: "DESC" },
      });

      if (sessions.length === 0) {
        throw new UnauthorizedException(
          "No hay sesi�n activa. Por favor, inicie sesi�n nuevamente",
        );
      }

      // Verificar la sesi�n m�s reciente
      const mostRecentSession = sessions[0];
      const now = new Date();
      const timeSinceLastActivity =
        now.getTime() - mostRecentSession.last_activity.getTime();

      if (timeSinceLastActivity > INACTIVITY_TIMEOUT_MS) {
        // Marcar todas las sesiones como inactivas por timeout
        await this.sessionRepo.update(
          { user_id: userId, is_active: true },
          { is_active: false, auto_logout: true },
        );

        throw new UnauthorizedException(
          "Su sesi�n ha expirado por inactividad. Por favor, inicie sesi�n nuevamente",
        );
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Token inv�lido - dejamos que JwtAuthGuard maneje esto
      return true;
    }
  }
}
