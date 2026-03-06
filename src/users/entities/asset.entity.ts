import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  asset_type: string; // badge, achievement, medal, logo, icon, illustration, background

  @Column({ type: 'text', nullable: true })
  category: string; // survival, exploration, leadership, combat, resource_management, etc.

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text' })
  public_id: string;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string;

  @Column({ type: 'int', nullable: true })
  rarity: number; // 1=común, 2=raro, 3=épico, 4=legendario (para gamificación)

  @Column({ type: 'json', nullable: true })
  metadata: object; // Datos adicionales flexibles (criterios de desbloqueo, dimensiones, etc.)

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
