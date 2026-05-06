/**
 * FinTrack — App.js
 * Main application controller
 */

import { loadTransactions, saveTransactions } from './components/Storage.js';
import { renderSummary }                       from './components/Summary.js';
import { initForm }                            from './components/Form.js';
import { renderTransactionList }               from './components/TransactionList.js';
import { initCharts, updateCharts, destroyAll, refreshChartTheme } from './components/Charts.js';
import { renderCategoryBreakdown }             from './components/Breakdown.js';
import { filterByDate, filterByCategory, filterByType } from './utils/filters.js';
import { generateInsight }                     from './utils/insights.js';
import { toCSV }                               from './utils/format.js';

// ─── State ────────────────────────────────────────────────────────────────────
let allTransactions = loadTransactions();
let pendingDeleteId = null;

// ─── Filters ──────────────────────────────────────────────────────────────────
function getFilters() {
  return {
    date:     document.getElementById('dateFilter')?.value     || 'all',
    category: document.getElementById('categoryFilter')?.value || 'all',
    type:     document.getElementById('typeFilter')?.value     || 'all',
  };
}

function getFilteredTransactions() {
  const { date, category, type } = getFilters();
  let txs = filterByDate(allTransactions, date);
  txs = filterByCategory(txs, category);
  txs = filterByType(txs, type);
  return txs;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  const filtered = getFilteredTransactions();

  renderSummary(filtered);
  renderTransactionList(filtered, confirmDelete);
  updateCharts(filtered);
  renderCategoryBreakdown(filtered);
  renderInsight(filtered);
}

function renderInsight(transactions) {
  const banner  = document.getElementById('insightBanner');
  const textEl  = document.getElementById('insightText');
  if (!banner || !textEl) return;

  const msg = generateInsight(transactions);
  if (msg) {
    textEl.textContent = msg;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

// ─── Add Transaction ──────────────────────────────────────────────────────────
function handleAdd(transaction) {
  allTransactions.push(transaction);
  saveTransactions(allTransactions);
  render();
  showToast('Transaction added successfully', 'success');
}

// ─── Delete Transaction ───────────────────────────────────────────────────────
function confirmDelete(id) {
  pendingDeleteId = id;
  document.getElementById('modal').classList.remove('hidden');
}

function executeDelete() {
  if (!pendingDeleteId) return;
  allTransactions = allTransactions.filter(t => t.id !== pendingDeleteId);
  saveTransactions(allTransactions);
  pendingDeleteId = null;
  closeModal();
  render();
  showToast('Transaction deleted', 'error');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  pendingDeleteId = null;
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV() {
  const filtered = getFilteredTransactions();
  if (filtered.length === 0) {
    showToast('No transactions to export', '');
    return;
  }
  const csv  = toCSV(filtered);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `fintrack_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported to CSV', 'success');
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('fintrack_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('fintrack_theme', next);

  // Give CSS time to update, then refresh chart colors
  setTimeout(() => {
    destroyAll();
    updateCharts(getFilteredTransactions());
  }, 150);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className   = `toast${type ? ' ' + type : ''}`;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ─── Seed Demo Data ───────────────────────────────────────────────────────────
function seedDemoData() {
  const today = new Date();
  const d = (offset) => {
    const dt = new Date(today);
    dt.setDate(today.getDate() - offset);
    return dt.toISOString().split('T')[0];
  };

  const demo = [
    { type: 'income',  amount: 4500,  category: 'Salary',        date: d(28), description: 'Monthly salary' },
    { type: 'income',  amount: 850,   category: 'Freelance',      date: d(20), description: 'Web design project' },
    { type: 'expense', amount: 1200,  category: 'Bills',          date: d(25), description: 'Rent payment' },
    { type: 'expense', amount: 320,   category: 'Food',           date: d(22), description: 'Groceries & dining' },
    { type: 'expense', amount: 85,    category: 'Transport',      date: d(18), description: 'Monthly transit pass' },
    { type: 'expense', amount: 240,   category: 'Shopping',       date: d(15), description: 'Clothing & accessories' },
    { type: 'expense', amount: 60,    category: 'Entertainment',  date: d(12), description: 'Streaming services' },
    { type: 'income',  amount: 200,   category: 'Investment',     date: d(10), description: 'Dividend payout' },
    { type: 'expense', amount: 150,   category: 'Health',         date: d(8),  description: 'Gym membership' },
    { type: 'expense', amount: 95,    category: 'Food',           date: d(5),  description: 'Restaurant dinner' },
    { type: 'expense', amount: 45,    category: 'Transport',      date: d(3),  description: 'Fuel' },
    { type: 'income',  amount: 4500,  category: 'Salary',         date: d(0),  description: 'Monthly salary' },
  ];

  allTransactions = demo.map((t, i) => ({
    ...t,
    id: `demo_${i}_${Date.now()}`,
    createdAt: Date.now() - i * 1000,
  }));

  saveTransactions(allTransactions);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  initTheme();
  initCharts();

  // Seed demo data for first-time visitors
  if (allTransactions.length === 0) {
    seedDemoData();
  }

  // Wire up form
  initForm(handleAdd);

  // Wire up filters
  ['dateFilter', 'categoryFilter', 'typeFilter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', render);
  });

  // Wire up export
  document.getElementById('exportBtn')?.addEventListener('click', exportCSV);

  // Wire up theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // Wire up modal
  document.getElementById('modalConfirm')?.addEventListener('click', executeDelete);
  document.getElementById('modalCancel')?.addEventListener('click', closeModal);
  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  render();
}

init();
