import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_active_temporary_assignment",
  expression: `
    SELECT
      ta.id                       AS assignment_id,
      ta.user_account_id,
      ua.camp_id,
      p.id                        AS person_id,
      p.first_name,
      p.last_name,
      p.status                    AS person_status,
      po.id                       AS origin_profession_id,
      po.name                     AS origin_profession_name,
      pt.id                       AS temporary_profession_id,
      pt.name                     AS temporary_profession_name,
      ta.start_date,
      ta.end_date,
      ta.reason,
      ta.user_approve_id
    FROM temporary_assignment ta
    INNER JOIN user_account ua    ON ua.id = ta.user_account_id
    INNER JOIN person p           ON p.id = ua.person_id
    INNER JOIN profession po      ON po.id = ta.profession_origin_id
    INNER JOIN profession pt      ON pt.id = ta.profession_temporary_id
    WHERE ta.end_date IS NULL OR ta.end_date > NOW()
  `,
})
export class ActiveTemporaryAssignmentView {
  @ViewColumn()
  assignment_id: number;

  @ViewColumn()
  user_account_id: number;

  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  person_id: number;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  person_status: string;

  @ViewColumn()
  origin_profession_id: number;

  @ViewColumn()
  origin_profession_name: string;

  @ViewColumn()
  temporary_profession_id: number;

  @ViewColumn()
  temporary_profession_name: string;

  @ViewColumn()
  start_date: Date;

  @ViewColumn()
  end_date: Date | null;

  @ViewColumn()
  reason: string;

  @ViewColumn()
  user_approve_id: number;
}
