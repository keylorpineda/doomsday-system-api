import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exploration } from './exploration.entity';
import { Resource } from '../../resources/entities/resource.entity';

@Entity('exploration_resource')
export class ExplorationResource {
  @PrimaryColumn({ type: 'bigint' })
  exploration_id: number;

  @PrimaryColumn({ type: 'bigint' })
  resource_id: number;

  @PrimaryColumn({ type: 'text' })
  flow: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @ManyToOne(() => Exploration, (e) => e.explorationResources)
  @JoinColumn({ name: 'exploration_id' })
  exploration: Exploration;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
