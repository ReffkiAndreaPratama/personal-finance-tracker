/**
 * Storage — LocalStorage persistence layer
 */

const STORAGE_KEY = 'fintrack_transactions';

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

export function clearTransactions() {
  localStorage.removeItem(STORAGE_KEY);
}
