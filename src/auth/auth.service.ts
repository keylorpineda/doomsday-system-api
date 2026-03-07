import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginAttempt } from './entities/login-attempt.entity';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepo: Repository<LoginAttempt>,
  ) {}

  async logLoginAttempt(data: {
    username: string;
    ip_address: string;
    user_agent?: string;
    success: boolean;
    failure_reason?: string;
    user_id?: number;
  }): Promise<void> {
    const attempt = this.loginAttemptRepo.create(data);
    await this.loginAttemptRepo.save(attempt);
  }

  async countRecentFailures(ip_address: string, windowMs = 15 * 60 * 1000): Promise<number> {
    return this.loginAttemptRepo.count({
      where: {
        ip_address,
        success: false,
        attempted_at: MoreThan(new Date(Date.now() - windowMs)),
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
