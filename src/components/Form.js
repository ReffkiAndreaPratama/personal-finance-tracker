/**
 * Form — Transaction input form logic
 */

import { generateId } from '../utils/format.js';

export function initForm(onAdd) {
  const form        = document.getElementById('transactionForm');
  const typeInput   = document.getElementById('transactionType');
  const typeBtns    = document.querySelectorAll('.type-btn');
  const amountEl    = document.getElementById('amount');
  const dateEl      = document.getElementById('date');
  const categoryEl  = document.getElementById('category');
  const descEl      = document.getElementById('description');

  // Set today's date as default
  dateEl.value = new Date().toISOString().split('T')[0];

  // Type toggle
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeInput.value = btn.dataset.type;
    });
  });

  // Form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const transaction = {
      id:          generateId(),
      type:        typeInput.value,
      amount:      parseFloat(amountEl.value),
      category:    categoryEl.value,
      date:        dateEl.value,
      description: descEl.value.trim() || categoryEl.value,
      createdAt:   Date.now(),
    };

    onAdd(transaction);
    resetForm();
  });

  function validateForm() {
    let valid = true;

    // Amount
    const amt = parseFloat(amountEl.value);
    if (!amountEl.value || isNaN(amt) || amt <= 0) {
      showError('amountError', amountEl, 'Enter a valid amount greater than 0');
      valid = false;
    } else {
      clearError('amountError', amountEl);
    }

    // Date
    if (!dateEl.value) {
      showError('dateError', dateEl, 'Please select a date');
      valid = false;
    } else {
      clearError('dateError', dateEl);
    }

    // Category
    if (!categoryEl.value) {
      showError('categoryError', categoryEl, 'Please select a category');
      valid = false;
    } else {
      clearError('categoryError', categoryEl);
    }

    return valid;
  }

  function showError(errorId, inputEl, msg) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = msg;
    inputEl.classList.add('error');
  }

  function clearError(errorId, inputEl) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = '';
    inputEl.classList.remove('error');
  }

  function resetForm() {
    amountEl.value      = '';
    descEl.value        = '';
    categoryEl.value    = '';
    dateEl.value        = new Date().toISOString().split('T')[0];
    ['amountError','dateError','categoryError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    [amountEl, dateEl, categoryEl].forEach(el => el.classList.remove('error'));
  }
}
