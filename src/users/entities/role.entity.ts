import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("role")
export class Role {
  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  /**
   * Values: "admin" | "worker" | "resource_manager" | "travel_comms"
   */
  @Column({ type: "text", unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;
}
