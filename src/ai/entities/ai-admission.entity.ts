import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Person } from '../../users/entities/person.entity';
import { Profession } from '../../users/entities/profession.entity';
import { UserAccount } from '../../users/entities/user-account.entity';

@Entity('ai_admission')
export class AiAdmission {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  person_id: number;

  @Column({ type: 'text', nullable: true })
  suggested_status: string;

  @Column({ type: 'bigint', nullable: true })
  suggested_profession_id: number;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ type: 'json', nullable: true })
  raw_ai_response: object;

  @Column({ type: 'bigint', nullable: true })
  reviewed_by_user_id: number;

  @Column({ type: 'text', nullable: true })
  final_human_decision: string;

  @Column({ type: 'timestamptz', nullable: true })
  evaluation_date: Date;

  @ManyToOne(() => Person, (p) => p.aiAdmissions)
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ManyToOne(() => Profession)
  @JoinColumn({ name: 'suggested_profession_id' })
  suggestedProfession: Profession;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy: UserAccount;
}
