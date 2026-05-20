import { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import './ExpenseModal.css';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Health & Medical', 'Travel', 'Education',
  'Personal Care', 'Other',
];

const today = () => new Date().toISOString().split('T')[0];

const defaultForm = { title: '', amount: '', category: '', date: today(), notes: '' };

const ExpenseModal = ({ expense, onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { addExpense, editExpense } = useExpenses();
  const toast = useToast();
  const isEdit = Boolean(expense);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date ? expense.date.split('T')[0] : today(),
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.category || !form.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await editExpense(expense._id, form);
      } else {
        await addExpense(form);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title <span className="required">*</span></label>
            <input
              id="title" name="title" type="text" value={form.title}
              onChange={handleChange} placeholder="e.g. Grocery shopping"
              maxLength={100} required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount <span className="required">*</span></label>
              <div className="input-prefix">
                <span>₹</span>
                <input
                  id="amount" name="amount" type="number" value={form.amount}
                  onChange={handleChange} placeholder="0.00"
                  min="0.01" step="0.01" required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date <span className="required">*</span></label>
              <input
                id="date" name="date" type="date" value={form.date}
                onChange={handleChange} required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category <span className="required">*</span></label>
            <select id="category" name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes" name="notes" value={form.notes}
              onChange={handleChange} placeholder="Optional notes..."
              rows={3} maxLength={500}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
