function createCard(title, bodyHtml) {
  return `
    <section class="card">
      <h3 class="card-title">${title}</h3>
      <div class="card-body">${bodyHtml}</div>
    </section>
  `;
}

function renderTimingIndicator(row) {
  if (row.is_late) return `<span class="pill late">Late ${row.delay_days}d</span>`;
  if (row.is_overdue) return `<span class="pill overdue">Overdue ${row.overdue_days}d</span>`;
  return `<span class="pill ok">On Track</span>`;
}

function statusClass(status) {
  return status.replace(' ', '-');
}

function summarizeStatus(rows) {
  return rows.reduce(
    (acc, row) => {
      acc[row.planning_status] = (acc[row.planning_status] || 0) + 1;
      if (row.is_overdue) acc.overdue += 1;
      return acc;
    },
    { 'Pending Planning': 0, Confirmed: 0, Released: 0, Completed: 0, overdue: 0 }
  );
}

function renderGroupedStatusTables(state) {
  const statusOrder = ['Pending Planning', 'Confirmed', 'Released', 'Completed'];

  return statusOrder
    .map((status) => {
      const items = state.filteredRows.filter((row) => row.planning_status === status);
      const rows = items.map((o) => `
        <tr class="status-row ${statusClass(o.planning_status)} ${o.is_overdue ? 'overdue-row' : ''}">
          <td><input type="checkbox" data-line-id="${o.line_id}" ${state.selection.has(o.line_id) ? 'checked' : ''}></td>
          <td>${o.SO_No}</td><td>${o.detail_line_no}</td><td>${o.Customer}</td><td>${o.mod_name}</td><td>${o.qty}</td>
          <td>${o.customer_req_week}</td><td>${o.plan_week}</td><td>${o.planfinish_date}</td>
          <td>${o.is_customer_confirmed ? 'Yes' : 'No'}</td>
          <td>${o.can_release ? 'Ready to Release' : 'Not Ready'}</td>
          <td>${renderTimingIndicator(o)}</td>
        </tr>
      `).join('');

      return `
        <section class="status-group">
          <h4><span class="badge ${statusClass(status)}">${status}</span> ${items.length} items</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Select</th><th>SO_No</th><th>Line#</th><th>Customer</th><th>Model</th><th>Qty</th>
                  <th>Customer Req Week</th><th>Plan Week</th><th>Plan Finish</th><th>Cust Confirmed</th><th>Release Readiness</th><th>Timing Risk</th>
                </tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="12" class="muted">No items in this status</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      `;
    })
    .join('');
}

export function renderTabs(container, pages, activePage, onTabClick) {
  container.innerHTML = pages
    .map((p) => `<button class="tab-btn ${p.key === activePage ? 'active' : ''}" data-key="${p.key}">${p.label}</button>`)
    .join('');

  container.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => onTabClick(btn.dataset.key));
  });
}

export function renderSalesOrdersPage(state) {
  const statusSummary = summarizeStatus(state.filteredRows);

  return [
    createCard('Planner Workflow View (Status-first)', `
      <ul class="compact">
        <li><strong>Pending Planning</strong>: ต้องติดตาม customer confirmation.</li>
        <li><strong>Confirmed</strong>: พร้อมเข้ารอบ release.</li>
        <li><strong>Released</strong>: ปล่อยไปฝ่ายผลิตแล้ว.</li>
        <li><strong>Completed</strong>: ผลิตเสร็จแล้ว ใช้ดูผลเทียบแผน.</li>
      </ul>
      <p class="muted">Import ในหน้านี้เป็น mock/prototype only. Excel import จาก Vector เป็น future scope.</p>
    `),
    createCard('Planning Queue Summary', `
      <div class="grid-2">
        <div><span class="badge Pending-Planning">Pending Planning</span> ${statusSummary['Pending Planning']}</div>
        <div><span class="badge Confirmed">Confirmed</span> ${statusSummary.Confirmed}</div>
        <div><span class="badge Released">Released</span> ${statusSummary.Released}</div>
        <div><span class="badge Completed">Completed</span> ${statusSummary.Completed}</div>
      </div>
      <p><span class="pill overdue">Overdue items: ${statusSummary.overdue}</span></p>
    `),
    createCard('Filters & Weekly Plan Actions', `
      <div class="filters">
        <input id="f-customer" placeholder="Customer contains" value="${state.filters.customer}">
        <select id="f-status">
          <option value="">All status</option>
          <option ${state.filters.status === 'Pending Planning' ? 'selected' : ''}>Pending Planning</option>
          <option ${state.filters.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option ${state.filters.status === 'Released' ? 'selected' : ''}>Released</option>
          <option ${state.filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
        </select>
        <label><input type="checkbox" id="f-confirmed-only" ${state.filters.confirmedOnly ? 'checked' : ''}> confirmed only</label>
        <input type="date" id="f-from" value="${state.filters.fromDate}">
        <input type="date" id="f-to" value="${state.filters.toDate}">
        <button id="apply-filter">Apply</button>
        <input type="file" id="import-file" accept="application/json">
      </div>
      <div class="actions">
        <button class="primary" id="create-plan">Create Weekly Production Plan (${state.selection.size} selected)</button>
      </div>
    `),
    createCard('Grouped Items by Planning Status', renderGroupedStatusTables(state))
  ].join('');
}

export function renderPlansPage(state) {
  const plans = state.plans.map((p) => `
    <tr>
      <td>${p.planId}</td><td>${p.week}</td><td>${p.lineCount}</td>
      <td>${p.releasableCount}</td>
      <td>${p.capacityPass ? 'Pass' : 'Below min(36)'}</td>
      <td><span class="badge ${statusClass(p.status)}">${p.status}</span></td>
      <td>${new Date(p.createdAt).toLocaleString()}</td>
    </tr>
  `).join('');

  return createCard('Weekly Production Plans (using plan_week)', `
      <p class="muted">This page summarizes weekly planning batches created from selected planning items.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Plan ID</th><th>Plan Week</th><th>Items</th><th>Releasable Items</th><th>Capacity Rule</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>${plans || '<tr><td colspan="7" class="muted">No plans yet</td></tr>'}</tbody>
        </table>
      </div>
  `);
}

export function renderReleasePage(state) {
  const latest = state.plans[state.plans.length - 1];
  if (!latest) {
    return createCard('Release Plan → Production Orders', '<p class="muted">Create a plan first from Sales Order Items page.</p>');
  }

  const poRows = (latest.productionOrders || []).map((po) => `
    <tr><td>${po.productionOrderId}</td><td>${po.SO_No}</td><td>${po.line_id}</td><td>${po.qty}</td><td>${po.production_date}</td><td>${po.planfinish_date}</td><td>${po.planning_status}</td></tr>
  `).join('');

  const summary = latest.releaseSummary
    ? `<p>Release result: released ${latest.releaseSummary.released}/${latest.releaseSummary.totalSelected}, blocked not releasable ${latest.releaseSummary.blockedNotReleasable}</p>`
    : '<p>Only item lines allowed by canReleaseToProduction(row) can be released.</p>';

  return createCard('Release Control for Planners', `
    <p>Latest plan: <strong>${latest.planId}</strong> | Plan Week ${latest.week} | Status <span class="badge ${statusClass(latest.status)}">${latest.status}</span></p>
    ${summary}
    <div class="actions">
      <button id="confirm-plan">Set Plan Confirmed</button>
      <button class="success" id="release-plan">Release Eligible Items to Production</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>PO</th><th>SO</th><th>Line</th><th>Qty</th><th>Production Date</th><th>Plan Finish</th><th>Status</th></tr></thead>
        <tbody>${poRows || '<tr><td colspan="7" class="muted">Not released yet</td></tr>'}</tbody>
      </table>
    </div>
  `);
}

export function renderAnalysisPage(state) {
  const riskRows = state.rows.filter((r) => r.is_late || r.is_overdue);
  const rows = riskRows.map((r) => `
    <tr class="${r.is_overdue ? 'overdue-row' : ''}"><td>${r.SO_No}</td><td>${r.line_id}</td><td>${r.planfinish_date}</td><td>${r.finish_date || '-'}</td><td>${r.is_late ? `Late ${r.delay_days}d` : '-'}</td><td>${r.is_overdue ? `Overdue ${r.overdue_days}d` : '-'}</td></tr>
  `).join('');

  return createCard('Delay & Overdue Analysis Scaffold', `
    <p>Completed items use <strong>is_late/delay_days</strong>; unfinished items use <strong>is_overdue/overdue_days</strong>.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>SO</th><th>Line</th><th>Plan Finish</th><th>Actual Finish</th><th>Late</th><th>Overdue</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" class="muted">No late/overdue items in current mock data</td></tr>'}</tbody>
      </table>
    </div>
  `);
}
