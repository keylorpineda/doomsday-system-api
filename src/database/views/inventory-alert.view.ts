import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'vw_inventory_alert',
  expression: `
    SELECT
      i.camp_id,
      i.resource_id,
      r.name        AS resource_name,
      r.category    AS resource_category,
      i.current_quantity,
      i.minimum_stock_required,
      i.last_update
    FROM inventory i
    INNER JOIN resource r ON r.id = i.resource_id
    WHERE i.current_quantity < i.minimum_stock_required
  `,
})
export class InventoryAlertView {
  @ViewColumn()
  camp_id: number;

  @ViewColumn()
  resource_id: number;

  @ViewColumn()
  resource_name: string;

  @ViewColumn()
  resource_category: string;

  @ViewColumn()
  current_quantity: number;

  @ViewColumn()
  minimum_stock_required: number;

  @ViewColumn()
  last_update: Date;
}
