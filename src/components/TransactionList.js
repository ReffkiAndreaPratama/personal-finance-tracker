/**
 * TransactionList — Renders grouped, filterable transaction list
 */

import { formatCurrency, formatDate } from '../utils/format.js';
import { CATEGORY_ICONS } from '../utils/categories.js';

export function renderTransactionList(transactions, onDelete) {
  const container = document.getElementById('transactionList');
  if (!container) return;

  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        <p>No transactions yet</p>
        <span>Add your first transaction above</span>
      </div>`;
    return;
  }

  // Group by date
  const groups = {};
  [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date) || b.createdAt - a.createdAt)
    .forEach(tx => {
      const key = tx.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

  let html = '';
  Object.entries(groups).forEach(([date, txs]) => {
    html += `<div class="date-group-label">${formatDate(date)}</div>`;
    txs.forEach(tx => {
      const icon = CATEGORY_ICONS[tx.category] || '📦';
      const sign = tx.type === 'income' ? '+' : '-';
      html += `
        <div class="transaction-item" data-id="${tx.id}">
          <div class="tx-icon ${tx.type}">${icon}</div>
          <div class="tx-info">
            <div class="tx-desc">${escapeHtml(tx.description)}</div>
            <div class="tx-cat">${tx.category}</div>
          </div>
          <div class="tx-amount ${tx.type}">${sign}${formatCurrency(tx.amount)}</div>
          <button class="tx-delete" data-id="${tx.id}" title="Delete transaction" aria-label="Delete transaction">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>`;
    });
  });

  container.innerHTML = html;

  // Bind delete buttons
  container.querySelectorAll('.tx-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      onDelete(btn.dataset.id);
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
