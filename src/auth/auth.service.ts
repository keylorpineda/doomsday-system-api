import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { LoginAttempt } from './entities/login-attempt.entity';

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
}
