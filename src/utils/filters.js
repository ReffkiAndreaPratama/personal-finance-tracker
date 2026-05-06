/**
 * Filter utilities
 */

export function filterByDate(transactions, period) {
  if (period === 'all') return transactions;

  const now   = new Date();
  const start = new Date();

  if (period === 'week') {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return transactions.filter(t => new Date(t.date + 'T00:00:00') >= start);
}

export function filterByCategory(transactions, category) {
  if (category === 'all') return transactions;
  return transactions.filter(t => t.category === category);
}

export function filterByType(transactions, type) {
  if (type === 'all') return transactions;
  return transactions.filter(t => t.type === type);
}
