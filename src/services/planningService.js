import {
  calculatePlanFinishDate,
  canReleaseToProduction,
  derivePlanningStatus,
  deriveTimingMetrics,
  getIsoWeek,
  hasMinimumCapacity,
  ITEM_PLANNING_STATUSES,
  PLAN_STATUSES
} from '../domain/planningRules.js';

export function mergeSalesOrders(headerRows, detailRows) {
  const headerMap = new Map(headerRows.map((h) => [h.SO_No, h]));
  return detailRows
    .map((d, idx) => {
      const h = headerMap.get(d.SO_No);
      if (!h) return null;

      // Temporary identity strategy for prototype:
      // use mock detail_line_no if available; otherwise fallback to index-based line_id.
      const detailLineNo = d.detail_line_no ?? idx + 1;
      const lineIdSource = d.detail_line_no ? `L${detailLineNo}` : `TMP${idx + 1}`;

      const merged = {
        line_id: `${d.SO_No}-${lineIdSource}`,
        detail_line_no: detailLineNo,
        ...h,
        is_customer_confirmed: false,
        ...d
      };

      const planfinish_date = calculatePlanFinishDate(merged);
      const withPlan = { ...merged, planfinish_date };
      const planning_status = derivePlanningStatus(withPlan);
      const timing = deriveTimingMetrics(withPlan);

      return {
        ...withPlan,
        customer_req_week: getIsoWeek(withPlan.customer_req_date),
        plan_week: getIsoWeek(withPlan.planning_req_date || withPlan.planfinish_date || withPlan.customer_req_date),
        planning_status,
        can_release: canReleaseToProduction({ ...withPlan, planning_status }),
        ...timing
      };
    })
    .filter(Boolean);
}

export function sortOrdersForPlanning(rows) {
  return [...rows].sort(
    (a, b) =>
      new Date(a.customer_req_date) - new Date(b.customer_req_date) ||
      new Date(a.planning_req_date) - new Date(b.planning_req_date)
  );
}

export function filterOrders(rows, criteria) {
  return rows.filter((row) => {
    const byCustomer = criteria.customer ? row.Customer.toLowerCase().includes(criteria.customer.toLowerCase()) : true;
    const byStatus = criteria.status ? row.planning_status === criteria.status : true;
    const byConfirmed = criteria.confirmedOnly ? row.is_customer_confirmed : true;
    const byFrom = criteria.fromDate ? row.customer_req_date >= criteria.fromDate : true;
    const byTo = criteria.toDate ? row.customer_req_date <= criteria.toDate : true;
    return byCustomer && byStatus && byConfirmed && byFrom && byTo;
  });
}

export function buildWeeklyPlan({ selectedOrders, planner = 'Planning Team' }) {
  const planLines = selectedOrders.map((row) => ({
    line_id: row.line_id,
    detail_line_no: row.detail_line_no,
    SO_No: row.SO_No,
    model: row.mod_name,
    qty: row.qty,
    customer_req_date: row.customer_req_date,
    customer_req_week: row.customer_req_week,
    planning_req_date: row.planning_req_date,
    planfinish_date: row.planfinish_date,
    plan_week: row.plan_week,
    planning_status: row.planning_status,
    is_customer_confirmed: row.is_customer_confirmed,
    can_release: row.can_release,
    is_late: row.is_late,
    delay_days: row.delay_days,
    is_overdue: row.is_overdue,
    overdue_days: row.overdue_days
  }));

  const planWeek = planLines.length ? planLines[0].plan_week : 'TBD';
  const planningItemCount = planLines.length;
  return {
    planId: `PLAN-${Date.now()}`,
    week: planWeek,
    planner,
    status: PLAN_STATUSES[0],
    lineCount: planningItemCount,
    capacityPass: hasMinimumCapacity(planningItemCount),
    releasableCount: planLines.filter((line) => line.can_release).length,
    lines: planLines,
    createdAt: new Date().toISOString()
  };
}

export function releasePlan(plan) {
  const releaseDate = new Date().toISOString().slice(0, 10);

  const updatedLines = plan.lines.map((line) => {
    if (!canReleaseToProduction(line)) {
      return { ...line, can_release: canReleaseToProduction(line) };
    }

    return {
      ...line,
      production_date: releaseDate,
      planning_status: ITEM_PLANNING_STATUSES.released,
      can_release: false
    };
  });

  const releasedLines = updatedLines.filter((line) => line.production_date === releaseDate);

  return {
    ...plan,
    lines: updatedLines,
    status: releasedLines.length ? 'Released' : plan.status,
    releasedAt: releasedLines.length ? new Date().toISOString() : plan.releasedAt,
    releaseSummary: {
      totalSelected: plan.lines.length,
      released: releasedLines.length,
      blockedNotReleasable: plan.lines.length - releasedLines.length
    },
    productionOrders: releasedLines.map((line, idx) => ({
      productionOrderId: `PO-${plan.planId.slice(-4)}-${idx + 1}`,
      SO_No: line.SO_No,
      line_id: line.line_id,
      qty: line.qty,
      production_date: releaseDate,
      planfinish_date: line.planfinish_date,
      planning_status: ITEM_PLANNING_STATUSES.released
    }))
  };
}
