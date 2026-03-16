import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_transfer_camp_summary",
  expression: `
    SELECT
      c.id          AS camp_id,
      c.name        AS camp_name,
      COUNT(ir.id)  AS total_requests,
      COUNT(ir.id) FILTER (WHERE ir.status = "pending")    AS pending,
      COUNT(ir.id) FILTER (WHERE ir.status = "approved")   AS approved,
      COUNT(ir.id) FILTER (WHERE ir.status = "completed")  AS completed,
      COUNT(ir.id) FILTER (WHERE ir.status = "rejected")   AS rejected,
      COUNT(ir.id) FILTER (WHERE ir.status = "cancelled")  AS cancelled,
      COUNT(ir.id) FILTER (WHERE ir.camp_origin_id = c.id) AS as_origin,
      COUNT(ir.id) FILTER (WHERE ir.camp_destination_id = c.id) AS as_destination
    FROM camp c
    LEFT JOIN intercamp_request ir
      ON ir.camp_origin_id = c.id OR ir.camp_destination_id = c.id
    WHERE c.active = TRUE
    GROUP BY c.id, c.name
  `,
})
export class TransferCampSummaryView {
  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  camp_name: string;

  @ViewColumn()
  total_requests: number;

  @ViewColumn()
  pending: number;

  @ViewColumn()
  approved: number;

  @ViewColumn()
  completed: number;

  @ViewColumn()
  rejected: number;

  @ViewColumn()
  cancelled: number;

  @ViewColumn()
  as_origin: number;

  @ViewColumn()
  as_destination: number;
}
