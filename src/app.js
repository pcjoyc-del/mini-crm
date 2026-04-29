import { salesOrderHeader, salesOrderDetails } from './data/sampleSalesOrders.js';
import { filterOrders, sortOrdersForPlanning, buildWeeklyPlan, releasePlan, mergeSalesOrders } from './services/planningService.js';
import { renderTabs, renderSalesOrdersPage, renderPlansPage, renderReleasePage, renderAnalysisPage } from './ui/render.js';

const pages = [
  { key: 'orders', label: '1) Sales Order Items' },
  { key: 'plans', label: '2) Weekly Plans' },
  { key: 'release', label: '3) Release' },
  { key: 'analysis', label: '4) Delay Analysis' }
];

const mergedRows = sortOrdersForPlanning(mergeSalesOrders(salesOrderHeader, salesOrderDetails));

const state = {
  activePage: 'orders',
  rows: mergedRows,
  filteredRows: [],
  filters: { customer: '', status: '', confirmedOnly: false, fromDate: '', toDate: '' },
  selection: new Set(),
  plans: []
};

const appEl = document.getElementById('app');
const tabsEl = document.getElementById('tabs');

function applyFilters() {
  state.filteredRows = filterOrders(state.rows, state.filters);
}

function render() {
  renderTabs(tabsEl, pages, state.activePage, (pageKey) => {
    state.activePage = pageKey;
    render();
  });

  if (state.activePage === 'orders') {
    appEl.innerHTML = renderSalesOrdersPage(state);
    bindOrderEvents();
  }
  if (state.activePage === 'plans') appEl.innerHTML = renderPlansPage(state);
  if (state.activePage === 'release') {
    appEl.innerHTML = renderReleasePage(state);
    bindReleaseEvents();
  }
  if (state.activePage === 'analysis') appEl.innerHTML = renderAnalysisPage(state);
}

function bindOrderEvents() {
  const byId = (id) => document.getElementById(id);

  byId('apply-filter').addEventListener('click', () => {
    state.filters.customer = byId('f-customer').value;
    state.filters.status = byId('f-status').value;
    state.filters.confirmedOnly = byId('f-confirmed-only').checked;
    state.filters.fromDate = byId('f-from').value;
    state.filters.toDate = byId('f-to').value;
    applyFilters();
    render();
  });

  document.querySelectorAll('input[data-line-id]').forEach((cb) => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.lineId;
      cb.checked ? state.selection.add(id) : state.selection.delete(id);
      render();
    });
  });

  byId('create-plan').addEventListener('click', () => {
    const selected = state.rows.filter((row) => state.selection.has(row.line_id));
    if (!selected.length) {
      alert('Please select at least 1 SO item line.');
      return;
    }

    const plan = buildWeeklyPlan({ selectedOrders: selected });
    state.plans.push(plan);
    state.selection.clear();
    state.activePage = 'plans';
    render();
  });

  byId('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload.SalesOrderHeader || !payload.SalesOrderDetails) {
        throw new Error('JSON must contain SalesOrderHeader and SalesOrderDetails');
      }
      state.rows = sortOrdersForPlanning(mergeSalesOrders(payload.SalesOrderHeader, payload.SalesOrderDetails));
      applyFilters();
      state.selection.clear();
      render();
    } catch (error) {
      alert(`Import error: ${error.message}`);
    }
  });
}

function bindReleaseEvents() {
  const latestIndex = state.plans.length - 1;
  const latestPlan = state.plans[latestIndex];
  if (!latestPlan) return;

  document.getElementById('confirm-plan')?.addEventListener('click', () => {
    state.plans[latestIndex] = { ...latestPlan, status: 'Confirmed' };
    render();
  });

  document.getElementById('release-plan')?.addEventListener('click', () => {
    state.plans[latestIndex] = releasePlan({ ...latestPlan, status: 'Released' });
    render();
  });
}

applyFilters();
render();
