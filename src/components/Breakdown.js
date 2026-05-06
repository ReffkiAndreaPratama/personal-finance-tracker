/**
 * Breakdown — Category expense breakdown with progress bars
 */

import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/categories.js';
import { formatCurrency } from '../utils/format.js';

export function renderCategoryBreakdown(transactions) {
  const container = document.getElementById('categoryBreakdown');
  if (!container) return;

  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:20px">
        <p>No expense data</p>
      </div>`;
    return;
  }

  const totals = {};
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max    = sorted[0][1];
  const total  = sorted.reduce((s, [, v]) => s + v, 0);

  container.innerHTML = sorted.map(([cat, amt], i) => {
    const pct   = Math.round((amt / total) * 100);
    const width = Math.round((amt / max) * 100);
    const color = CATEGORY_COLORS[cat] || '#94A3B8';
    const icon  = CATEGORY_ICONS[cat]  || '📦';

    return `
      <div class="breakdown-row" style="animation-delay:${i * 40}ms">
        <div class="breakdown-label" title="${cat}">${icon} ${cat}</div>
        <div class="breakdown-bar-wrap">
          <div class="breakdown-bar" style="width:${width}%;background:${color}"></div>
        </div>
        <div class="breakdown-amount">${formatCurrency(amt)}</div>
        <div class="breakdown-pct">${pct}%</div>
      </div>`;
  }).join('');
}
