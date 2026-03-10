import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'vw_person_profession_stats',
  expression: `
    SELECT
      ua.camp_id,
      pr.name       AS profession_name,
      COUNT(*)      AS total,
      COUNT(CASE WHEN p.can_work = TRUE AND p.status = 'active' THEN 1 END)
                    AS active,
      COUNT(CASE WHEN p.can_work = FALSE OR p.status != 'active' THEN 1 END)
                    AS inactive
    FROM person p
    LEFT JOIN profession pr   ON pr.id = p.profession_id
    LEFT JOIN user_account ua ON ua.person_id = p.id
    GROUP BY ua.camp_id, pr.name
  `,
})
export class PersonProfessionStatsView {
  @ViewColumn()
  camp_id: number | null;

  @ViewColumn()
  profession_name: string;

  @ViewColumn()
  total: number;

  @ViewColumn()
  active: number;

  @ViewColumn()
  inactive: number;
}
