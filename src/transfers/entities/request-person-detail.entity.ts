import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { IntercampRequest } from "./intercamp-request.entity";
import { Person } from "../../users/entities/person.entity";

@Entity("request_person_detail")
export class RequestPersonDetail {
  @PrimaryColumn({ type: "bigint" })
  request_id: number;

  @PrimaryColumn({ type: "bigint" })
  person_id: number;

  @Column({ type: "boolean", default: false })
  is_leader: boolean;

  @Column({ type: "text", default: "pending" })
  transfer_status: string;

  @ManyToOne(() => IntercampRequest, (r) => r.personDetails)
  @JoinColumn({ name: "request_id" })
  request: IntercampRequest;

  @ManyToOne(() => Person)
  @JoinColumn({ name: "person_id" })
  person: Person;
}
