import { useEffect, useState, useCallback } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import ExpenseModal from '../components/ExpenseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import './Expenses.css';

const CATEGORIES = [
  'all', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Health & Medical', 'Travel', 'Education', 'Personal Care', 'Other',
];

const SORTS = [
  { value: '-date', label: 'Newest first' },
  { value: 'date', label: 'Oldest first' },
  { value: '-amount', label: 'Highest amount' },
  { value: 'amount', label: 'Lowest amount' },
];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const CATEGORY_COLORS = {
  'Food & Dining': '#3b82f6', 'Transportation': '#10b981', 'Shopping': '#f59e0b',
  'Entertainment': '#8b5cf6', 'Bills & Utilities': '#ef4444', 'Health & Medical': '#06b6d4',
  'Travel': '#f97316', 'Education': '#84cc16', 'Personal Care': '#ec4899', 'Other': '#6b7280',
};

const Expenses = () => {
  const { expenses, loading, pagination, fetchExpenses, removeExpense } = useExpenses();
  const [filters, setFilters] = useState({ category: 'all', search: '', sort: '-date', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    const params = { ...filters };
    if (params.category === 'all') delete params.category;
    if (!params.search) delete params.search;
    if (!params.startDate) delete params.startDate;
    if (!params.endDate) delete params.endDate;
    fetchExpenses(params);
  }, [filters, fetchExpenses]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleFilter = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const clearFilters = () => setFilters({ category: 'all', search: '', sort: '-date', startDate: '', endDate: '' });

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (exp) => { setEditTarget(exp); setShowModal(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeExpense(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  const handleModalClose = () => { setShowModal(false); setEditTarget(null); load(); };

  const totalShown = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{pagination.total} total expenses</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Expense</button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text" placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
          />
        </div>

        <select value={filters.category} onChange={(e) => handleFilter('category', e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>

        <select value={filters.sort} onChange={(e) => handleFilter('sort', e.target.value)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <input
          type="date" value={filters.startDate} placeholder="From"
          onChange={(e) => handleFilter('startDate', e.target.value)}
        />
        <input
          type="date" value={filters.endDate} placeholder="To"
          onChange={(e) => handleFilter('endDate', e.target.value)}
        />

        <button className="btn-ghost" onClick={clearFilters}>Clear</button>
      </div>

      {expenses.length > 0 && (
        <div className="expenses-summary">
          Showing {expenses.length} of {pagination.total} — Total: <strong>{formatCurrency(totalShown)}</strong>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><LoadingSpinner /></div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No expenses found</h3>
          <p>Try adjusting your filters or add a new expense.</p>
          <button className="btn-primary" onClick={openAdd}>Add your first expense</button>
        </div>
      ) : (
        <div className="expenses-table-wrapper">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id} className="expense-row">
                  <td>
                    <div className="expense-title-cell">
                      <div className="expense-dot" style={{ background: CATEGORY_COLORS[exp.category] || '#6b7280' }} />
                      <div>
                        <span className="expense-title">{exp.title}</span>
                        {exp.notes && <span className="expense-notes">{exp.notes}</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge" style={{ background: `${CATEGORY_COLORS[exp.category]}22`, color: CATEGORY_COLORS[exp.category] || '#6b7280' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(exp.date)}</td>
                  <td className="amount-cell">{formatCurrency(exp.amount)}</td>
                  <td className="actions-cell">
                    <button className="action-btn edit-btn" onClick={() => openEdit(exp)} title="Edit">✎</button>
                    <button className="action-btn delete-btn" onClick={() => setDeleteTarget(exp)} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ExpenseModal expense={editTarget} onClose={handleModalClose} />}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Expenses;
