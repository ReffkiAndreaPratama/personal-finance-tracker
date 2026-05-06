/**
 * Smart Insights — generates contextual financial messages
 */

import { formatCurrency } from './format.js';

export function generateInsight(transactions) {
  if (transactions.length < 2) return null;

  const expenses = transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) return null;

  // Find top spending category
  const catTotals = {};
  expenses.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const [topCat, topAmt] = sorted[0];

  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const pct = Math.round((topAmt / totalExpense) * 100);

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const balance = income - totalExpense;

  // Pick the most relevant insight
  if (balance < 0) {
    return `⚠️ Your expenses exceed income by ${formatCurrency(Math.abs(balance))}. Consider reviewing your spending.`;
  }

  if (pct >= 50) {
    return `💡 ${topCat} accounts for ${pct}% of your expenses (${formatCurrency(topAmt)}). It's your biggest spending category.`;
  }

  if (sorted.length >= 2) {
    const [secondCat, secondAmt] = sorted[1];
    return `📊 Top spending: ${topCat} (${formatCurrency(topAmt)}) and ${secondCat} (${formatCurrency(secondAmt)}).`;
  }

  if (income > 0 && totalExpense / income > 0.8) {
    return `⚡ You've spent ${pct}% of your income. You're saving ${formatCurrency(balance)} so far.`;
  }

  return `✅ Looking good! You've saved ${formatCurrency(balance)} with ${pct}% of expenses in ${topCat}.`;
}
