/**
 * Summary — Balance summary cards renderer
 */

import { formatCurrency } from '../utils/format.js';

export function renderSummary(transactions) {
  const container = document.getElementById('summary');
  if (!container) return;

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  const count = transactions.length;
  const countLabel = count === 1 ? '1 transaction' : `${count} transactions`;

  container.innerHTML = `
    <div class="summary-card" style="animation-delay:0ms">
      <div class="summary-icon balance">💰</div>
      <div class="summary-info">
        <div class="summary-label">Current Balance</div>
        <div class="summary-value balance">${formatCurrency(balance)}</div>
        <div class="summary-sub">${countLabel} total</div>
      </div>
    </div>
    <div class="summary-card" style="animation-delay:60ms">
      <div class="summary-icon income">📈</div>
      <div class="summary-info">
        <div class="summary-label">Total Income</div>
        <div class="summary-value income">${formatCurrency(income)}</div>
        <div class="summary-sub">${transactions.filter(t => t.type === 'income').length} entries</div>
      </div>
    </div>
    <div class="summary-card" style="animation-delay:120ms">
      <div class="summary-icon expense">📉</div>
      <div class="summary-info">
        <div class="summary-label">Total Expenses</div>
        <div class="summary-value expense">${formatCurrency(expense)}</div>
        <div class="summary-sub">${transactions.filter(t => t.type === 'expense').length} entries</div>
      </div>
    </div>
  `;
}
