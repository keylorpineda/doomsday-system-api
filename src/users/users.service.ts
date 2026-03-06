import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from './entities/user-account.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
  ) {}

  findById(id: number): Promise<UserAccount | null> {
    return this.userAccountRepo.findOne({
      where: { id },
      relations: ['role'],
    });
  }
}
