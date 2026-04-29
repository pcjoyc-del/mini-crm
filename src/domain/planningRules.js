/**
 * PLAN_STATUSES = plan-level lifecycle for WeeklyProductionPlan.
 */
export const PLAN_STATUSES = ['Draft', 'Confirmed', 'Released', 'In Progress', 'Completed'];

/**
 * ITEM_PLANNING_STATUSES = item-level lifecycle for each merged planning row.
 */
export const ITEM_PLANNING_STATUSES = {
  pending: 'Pending Planning',
  confirmed: 'Confirmed',
  released: 'Released',
  completed: 'Completed'
};

export const CAPACITY_RULE = {
  weeklyMinimumLines: 36,
  planningHorizonWeeks: 2
};

/**
 * Business item status logic (derived from merged row):
 * finish_date -> Completed
 * production_date -> Released
 * is_customer_confirmed -> Confirmed
 * else Pending Planning
 */
export function derivePlanningStatus(row) {
  if (row.finish_date) return ITEM_PLANNING_STATUSES.completed;
  if (row.production_date) return ITEM_PLANNING_STATUSES.released;
  if (row.is_customer_confirmed) return ITEM_PLANNING_STATUSES.confirmed;
  return ITEM_PLANNING_STATUSES.pending;
}

/**
 * Can this item be released to production right now?
 * Rules:
 * - only Confirmed items can be released
 * - Completed cannot be released
 * - Released cannot be released again
 */
export function canReleaseToProduction(row) {
  const status = row.planning_status || derivePlanningStatus(row);
  if (status === ITEM_PLANNING_STATUSES.completed) return false;
  if (status === ITEM_PLANNING_STATUSES.released) return false;
  return status === ITEM_PLANNING_STATUSES.confirmed;
}

/**
 * planfinish_date rule:
 * 1) keep existing planfinish_date
 * 2) planning_req_date - 2 days
 * 3) fallback customer_req_date - 2 days
 */
export function calculatePlanFinishDate(row, leadTimeDays = 2) {
  if (row.planfinish_date) return row.planfinish_date;
  const baseDate = new Date(row.planning_req_date || row.customer_req_date);
  baseDate.setDate(baseDate.getDate() - leadTimeDays);
  return baseDate.toISOString().slice(0, 10);
}

/**
 * Delay metrics:
 * - completed lines use is_late/delay_days (finish_date vs planfinish_date)
 * - unfinished lines use is_overdue/overdue_days (today vs planfinish_date)
 */
export function deriveTimingMetrics(row, today = new Date()) {
  const base = { is_late: false, delay_days: 0, is_overdue: false, overdue_days: 0 };
  if (!row.planfinish_date) return base;

  const planFinish = new Date(row.planfinish_date);

  if (row.finish_date) {
    const finish = new Date(row.finish_date);
    const diffDays = Math.ceil((finish - planFinish) / 86400000);
    return {
      ...base,
      is_late: diffDays > 0,
      delay_days: diffDays > 0 ? diffDays : 0
    };
  }

  const diffToday = Math.ceil((today - planFinish) / 86400000);
  return {
    ...base,
    is_overdue: diffToday > 0,
    overdue_days: diffToday > 0 ? diffToday : 0
  };
}

export function getIsoWeek(dateString) {
  const date = new Date(dateString);
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function hasMinimumCapacity(planningItemCount) {
  return planningItemCount >= CAPACITY_RULE.weeklyMinimumLines;
}
