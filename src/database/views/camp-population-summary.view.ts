import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_camp_population_summary",
  expression: `
    SELECT
      c.id                        AS camp_id,
      c.name                      AS camp_name,
      c.max_capacity,
      COUNT(p.id) FILTER (WHERE p.status != 'deceased')
                                  AS total_people,
      COUNT(p.id) FILTER (WHERE p.can_work = TRUE AND p.status = 'active')
                                  AS active_workers,
      COUNT(p.id) FILTER (WHERE p.status != 'deceased')
        - COUNT(p.id) FILTER (WHERE p.can_work = TRUE AND p.status = 'active')
                                  AS unavailable_people,
      CASE
        WHEN c.max_capacity IS NOT NULL AND c.max_capacity > 0
        THEN ROUND(
          (COUNT(p.id) FILTER (WHERE p.status != 'deceased')::NUMERIC
           / c.max_capacity) * 100, 2
        )
        ELSE NULL
      END                         AS occupancy_rate
    FROM camp c
    LEFT JOIN user_account ua ON ua.camp_id = c.id
    LEFT JOIN person p        ON p.id = ua.person_id
    WHERE c.active = TRUE
    GROUP BY c.id, c.name, c.max_capacity
  `,
})
export class CampPopulationSummaryView {
  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  camp_name: string;

  @ViewColumn()
  max_capacity: number | null;

  @ViewColumn()
  total_people: number;

  @ViewColumn()
  active_workers: number;

  @ViewColumn()
  unavailable_people: number;

  @ViewColumn()
  occupancy_rate: number | null;
}
