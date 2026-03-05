import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // TODO: login(dto) - validar credenciales, crear session, retornar JWT
  // TODO: logout(userId) - invalidar session
  // TODO: validateToken(token) - verificar JWT y actividad de sesión
  // TODO: refreshSession(userId) - actualizar last_activity en session
}
