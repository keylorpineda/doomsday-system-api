-- ============================================================================
-- DATABASE VIEWS - Gestion del Fin
-- ============================================================================
-- These views encapsulate the most complex and frequently used queries
-- across the application services. They are read-only and do not modify
-- any existing logic or data.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. vw_camp_population_summary
--    Aggregated population metrics per camp.
--    Used by: DashboardService.buildCampMetrics, PersonsService.countPersonsByCamp
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_camp_population_summary AS
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
GROUP BY c.id, c.name, c.max_capacity;


-- --------------------------------------------------------------------------
-- 2. vw_person_status_stats
--    Person count grouped by status, optionally filterable by camp.
--    Used by: PersonsService.getStatsByStatus
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_person_status_stats AS
SELECT
    ua.camp_id,
    p.status,
    COUNT(*)                    AS person_count
FROM person p
LEFT JOIN user_account ua ON ua.person_id = p.id
GROUP BY ua.camp_id, p.status;


-- --------------------------------------------------------------------------
-- 3. vw_person_profession_stats
--    Person count grouped by profession with active/inactive breakdown.
--    Used by: PersonsService.getStatsByProfession
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_person_profession_stats AS
SELECT
    ua.camp_id,
    pr.name                     AS profession_name,
    COUNT(*)                    AS total,
    COUNT(CASE WHEN p.can_work = TRUE AND p.status = 'active' THEN 1 END)
                                AS active,
    COUNT(CASE WHEN p.can_work = FALSE OR p.status != 'active' THEN 1 END)
                                AS inactive
FROM person p
LEFT JOIN profession pr   ON pr.id = p.profession_id
LEFT JOIN user_account ua ON ua.person_id = p.id
GROUP BY ua.camp_id, pr.name;


-- --------------------------------------------------------------------------
-- 4. vw_inventory_status
--    Full inventory view with resource details and alert status.
--    Used by: DashboardService.buildWarehouseMetrics, ResourcesService.getInventoryByCamp
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_inventory_status AS
SELECT
    i.camp_id,
    i.resource_id,
    r.name                      AS resource_name,
    r.category                  AS resource_category,
    r.unit                      AS resource_unit,
    i.current_quantity,
    i.minimum_stock_required,
    i.alert_active,
    i.last_update
FROM inventory i
INNER JOIN resource r ON r.id = i.resource_id;


-- --------------------------------------------------------------------------
-- 5. vw_inventory_alert
--    Only inventory items where current stock is below minimum required.
--    Used by: ResourcesService.getInventoryAlerts, DashboardService (criticalResources)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_inventory_alert AS
SELECT
    i.camp_id,
    i.resource_id,
    r.name                      AS resource_name,
    r.category                  AS resource_category,
    i.current_quantity,
    i.minimum_stock_required,
    i.last_update
FROM inventory i
INNER JOIN resource r ON r.id = i.resource_id
WHERE i.current_quantity < i.minimum_stock_required;


-- --------------------------------------------------------------------------
-- 6. vw_transfer_camp_summary
--    Transfer request count breakdown by status per camp.
--    Used by: DashboardService.buildTransferMetrics, RequestsService.getTransferStatistics
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_transfer_camp_summary AS
SELECT
    c.id                        AS camp_id,
    c.name                      AS camp_name,
    COUNT(ir.id)                AS total_requests,
    COUNT(ir.id) FILTER (WHERE ir.status = 'pending')    AS pending,
    COUNT(ir.id) FILTER (WHERE ir.status = 'approved')   AS approved,
    COUNT(ir.id) FILTER (WHERE ir.status = 'completed')  AS completed,
    COUNT(ir.id) FILTER (WHERE ir.status = 'rejected')   AS rejected,
    COUNT(ir.id) FILTER (WHERE ir.status = 'cancelled')  AS cancelled,
    COUNT(ir.id) FILTER (WHERE ir.camp_origin_id = c.id) AS as_origin,
    COUNT(ir.id) FILTER (WHERE ir.camp_destination_id = c.id) AS as_destination
FROM camp c
LEFT JOIN intercamp_request ir
    ON ir.camp_origin_id = c.id OR ir.camp_destination_id = c.id
WHERE c.active = TRUE
GROUP BY c.id, c.name;


-- --------------------------------------------------------------------------
-- 7. vw_exploration_summary
--    Exploration details with aggregated person/resource counts.
--    Used by: ExplorationsService.findAll, DashboardService (activeExplorations count)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_exploration_summary AS
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
         e.real_return_date, e.status, e.notes, e.user_create_id;


-- --------------------------------------------------------------------------
-- 8. vw_active_temporary_assignment
--    Currently active temporary assignments with full person/profession details.
--    Used by: AssignmentsService.findActive
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_temporary_assignment AS
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
WHERE ta.end_date IS NULL OR ta.end_date > NOW();
