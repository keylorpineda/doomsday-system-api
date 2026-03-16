import { ViewEntity, ViewColumn } from "typeorm";

@ViewEntity({
  name: "vw_inventory_status",
  expression: `
    SELECT
      i.camp_id,
      i.resource_id,
      r.name        AS resource_name,
      r.category    AS resource_category,
      r.unit        AS resource_unit,
      i.current_quantity,
      i.minimum_stock_required,
      i.alert_active,
      i.last_update
    FROM inventory i
    INNER JOIN resource r ON r.id = i.resource_id
  `,
})
export class InventoryStatusView {
  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  resource_id: number;

  @ViewColumn()
  resource_name: string;

  @ViewColumn()
  resource_category: string;

  @ViewColumn()
  resource_unit: string;

  @ViewColumn()
  current_quantity: number;

  @ViewColumn()
  minimum_stock_required: number;

  @ViewColumn()
  alert_active: boolean;

  @ViewColumn()
  last_update: Date;
}
