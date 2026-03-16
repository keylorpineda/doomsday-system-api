import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_person_status_stats",
  expression: `
    SELECT
      ua.camp_id,
      p.status,
      COUNT(*)  AS person_count
    FROM person p
    LEFT JOIN user_account ua ON ua.person_id = p.id
    GROUP BY ua.camp_id, p.status
  `,
})
export class PersonStatusStatsView {
  @ViewColumn()
  camp_id: number | null;

  @ViewColumn()
  status: string;

  @ViewColumn()
  person_count: number;
}
