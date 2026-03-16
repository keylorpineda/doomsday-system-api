import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_exploration_summary",
  expression: `
    SELECT
      e.id                        AS exploration_id,
      e.camp_id,
      ca.name                     AS camp_name,
      e.name                      AS exploration_name,
      e.destination_description,
      e.departure_date,
      e.estimated_days,
      e.grace_days,
      e.real_return_date,
      e.status,
      e.notes,
      e.user_create_id,
      COUNT(DISTINCT ep.person_id)    AS total_persons,
      COUNT(DISTINCT CASE WHEN ep.is_leader = TRUE THEN ep.person_id END)
                                      AS leader_count,
      COALESCE(SUM(er_out.quantity) FILTER (WHERE er_out.flow = 'out'), 0)
                                      AS total_resources_out,
      COALESCE(SUM(er_in.quantity) FILTER (WHERE er_in.flow = 'in'), 0)
                                      AS total_resources_in
    FROM exploration e
    INNER JOIN camp ca ON ca.id = e.camp_id
    LEFT JOIN exploration_person ep   ON ep.exploration_id = e.id
    LEFT JOIN exploration_resource er_out
      ON er_out.exploration_id = e.id AND er_out.flow = 'out'
    LEFT JOIN exploration_resource er_in
      ON er_in.exploration_id = e.id AND er_in.flow = 'in'
    GROUP BY e.id, e.camp_id, ca.name, e.name, e.destination_description,
             e.departure_date, e.estimated_days, e.grace_days,
             e.real_return_date, e.status, e.notes, e.user_create_id
  `,
})
export class ExplorationSummaryView {
  @ViewColumn()
  exploration_id: number;

  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  camp_name: string;

  @ViewColumn()
  exploration_name: string;

  @ViewColumn()
  destination_description: string;

  @ViewColumn()
  departure_date: Date;

  @ViewColumn()
  estimated_days: number;

  @ViewColumn()
  grace_days: number;

  @ViewColumn()
  real_return_date: Date | null;

  @ViewColumn()
  status: string;

  @ViewColumn()
  notes: string | null;

  @ViewColumn()
  user_create_id: number | null;

  @ViewColumn()
  total_persons: number;

  @ViewColumn()
  leader_count: number;

  @ViewColumn()
  total_resources_out: number;

  @ViewColumn()
  total_resources_in: number;
}
