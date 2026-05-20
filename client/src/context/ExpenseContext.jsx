import { createContext, useContext, useState, useCallback } from 'react';
import { expenseAPI } from '../services/api';
import { useToast } from './ToastContext';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const toast = useToast();

  const fetchExpenses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await expenseAPI.getAll(params);
      setExpenses(data.expenses);
      setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await expenseAPI.getStats();
      setStats(data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load stats');
    }
  }, [toast]);

  const addExpense = useCallback(async (expenseData) => {
    const { data } = await expenseAPI.create(expenseData);
    setExpenses((prev) => [data.expense, ...prev]);
    toast.success('Expense added successfully');
    return data.expense;
  }, [toast]);

  const editExpense = useCallback(async (id, expenseData) => {
    const { data } = await expenseAPI.update(id, expenseData);
    setExpenses((prev) => prev.map((e) => (e._id === id ? data.expense : e)));
    toast.success('Expense updated successfully');
    return data.expense;
  }, [toast]);

  const removeExpense = useCallback(async (id) => {
    await expenseAPI.delete(id);
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    toast.success('Expense deleted');
  }, [toast]);

  return (
    <ExpenseContext.Provider value={{ expenses, stats, loading, pagination, fetchExpenses, fetchStats, addExpense, editExpense, removeExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
};
