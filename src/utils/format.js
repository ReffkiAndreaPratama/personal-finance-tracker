/**
 * Formatting utilities
 */

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday     = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday)     return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function generateId() {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function toCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
  const rows = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(t => [
      t.date,
      t.type,
      t.category,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.type === 'income' ? t.amount.toFixed(2) : (-t.amount).toFixed(2),
    ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}
