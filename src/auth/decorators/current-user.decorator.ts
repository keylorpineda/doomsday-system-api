import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrae el usuario autenticado del request.
 * Disponible en endpoints protegidos por JwtAuthGuard.
 * @example getProfile(@CurrentUser() user: { userId: number; username: string; role: string })
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
