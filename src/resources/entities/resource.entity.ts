import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';

@Entity('resource')
export class Resource {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  unit: string;

  @Column({ type: 'text' })
  category: string;

  @OneToMany(() => Inventory, (inv) => inv.resource)
  inventories: Inventory[];

  @OneToMany(() => InventoryMovement, (m) => m.resource)
  movements: InventoryMovement[];
}
