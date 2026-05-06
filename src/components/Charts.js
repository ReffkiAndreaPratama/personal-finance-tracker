/**
 * Charts — Chart.js powered analytics
 */

import { CATEGORY_COLORS } from '../utils/categories.js';
import { formatCurrency } from '../utils/format.js';

let pieChart  = null;
let lineChart = null;
let barChart  = null;

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 500, easing: 'easeInOutQuart' },
};

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    text:    style.getPropertyValue('--text-secondary').trim() || '#64748B',
    border:  style.getPropertyValue('--border').trim()         || '#E2E8F0',
    card:    style.getPropertyValue('--bg-card').trim()        || '#FFFFFF',
    primary: '#3B82F6',
    income:  '#22C55E',
    expense: '#EF4444',
  };
}

export function initCharts() {
  const tabs    = document.querySelectorAll('.chart-tab');
  const canvases = document.querySelectorAll('.chart-canvas');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      canvases.forEach(c => c.classList.remove('active'));
      const target = document.getElementById(`${tab.dataset.chart}Chart`);
      if (target) target.classList.add('active');
    });
  });
}

export function updateCharts(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const hasData  = transactions.length > 0;
  const emptyEl  = document.getElementById('chartEmpty');

  if (!hasData) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    destroyAll();
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  updatePieChart(expenses);
  updateLineChart(transactions);
  updateBarChart(transactions);
}

/* ---- Pie Chart: Expense by Category ---- */
function updatePieChart(expenses) {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;

  const totals = {};
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#94A3B8');
  const c = getThemeColors();

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data   = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.options.plugins.legend.labels.color = c.text;
    pieChart.update();
    return;
  }

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: c.card,
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: c.text,
            padding: 14,
            font: { size: 11, family: 'Inter' },
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
          },
        },
      },
    },
  });
}

/* ---- Line Chart: Balance Over Time ---- */
function updateLineChart(transactions) {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build cumulative balance per day
  const dayMap = {};
  sorted.forEach(t => {
    if (!dayMap[t.date]) dayMap[t.date] = 0;
    dayMap[t.date] += t.type === 'income' ? t.amount : -t.amount;
  });

  const dates = Object.keys(dayMap).sort();
  let running = 0;
  const balances = dates.map(d => {
    running += dayMap[d];
    return running;
  });

  const c = getThemeColors();

  if (lineChart) {
    lineChart.data.labels = dates;
    lineChart.data.datasets[0].data = balances;
    lineChart.options.scales.x.ticks.color = c.text;
    lineChart.options.scales.y.ticks.color = c.text;
    lineChart.options.scales.x.grid.color  = c.border;
    lineChart.options.scales.y.grid.color  = c.border;
    lineChart.update();
    return;
  }

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Balance',
        data: balances,
        borderColor: c.primary,
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: c.primary,
        pointBorderColor: c.card,
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` Balance: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: c.text, font: { size: 10, family: 'Inter' }, maxTicksLimit: 8 },
          grid:  { color: c.border },
        },
        y: {
          ticks: {
            color: c.text,
            font: { size: 10, family: 'Inter' },
            callback: v => formatCurrency(v),
          },
          grid: { color: c.border },
        },
      },
    },
  });
}

/* ---- Bar Chart: Monthly Income vs Expense ---- */
function updateBarChart(transactions) {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;

  const monthMap = {};
  transactions.forEach(t => {
    const [year, month] = t.date.split('-');
    const key = `${year}-${month}`;
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    monthMap[key][t.type] += t.amount;
  });

  const months  = Object.keys(monthMap).sort().slice(-12);
  const incomes  = months.map(m => monthMap[m].income);
  const expenses = months.map(m => monthMap[m].expense);

  const labels = months.map(m => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const c = getThemeColors();

  if (barChart) {
    barChart.data.labels = labels;
    barChart.data.datasets[0].data = incomes;
    barChart.data.datasets[1].data = expenses;
    barChart.options.scales.x.ticks.color = c.text;
    barChart.options.scales.y.ticks.color = c.text;
    barChart.options.scales.x.grid.color  = c.border;
    barChart.options.scales.y.grid.color  = c.border;
    barChart.update();
    return;
  }

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomes,
          backgroundColor: 'rgba(34,197,94,0.75)',
          borderColor: '#22C55E',
          borderWidth: 1.5,
          borderRadius: 5,
        },
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: 'rgba(239,68,68,0.75)',
          borderColor: '#EF4444',
          borderWidth: 1.5,
          borderRadius: 5,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        legend: {
          labels: {
            color: c.text,
            font: { size: 11, family: 'Inter' },
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: c.text, font: { size: 10, family: 'Inter' } },
          grid:  { color: c.border },
        },
        y: {
          ticks: {
            color: c.text,
            font: { size: 10, family: 'Inter' },
            callback: v => formatCurrency(v),
          },
          grid: { color: c.border },
        },
      },
    },
  });
}

export function destroyAll() {
  [pieChart, lineChart, barChart].forEach(c => c && c.destroy());
  pieChart = lineChart = barChart = null;
}

export function refreshChartTheme() {
  // Force re-render with new theme colors
  if (pieChart)  pieChart.update();
  if (lineChart) lineChart.update();
  if (barChart)  barChart.update();
}
