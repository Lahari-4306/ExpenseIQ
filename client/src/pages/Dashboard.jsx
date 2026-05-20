import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

const CATEGORY_COLORS = {
  'Food & Dining': '#3b82f6',
  'Transportation': '#10b981',
  'Shopping': '#f59e0b',
  'Entertainment': '#8b5cf6',
  'Bills & Utilities': '#ef4444',
  'Health & Medical': '#06b6d4',
  'Travel': '#f97316',
  'Education': '#84cc16',
  'Personal Care': '#ec4899',
  'Other': '#6b7280',
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Dashboard = () => {
  const { stats, fetchStats, loading } = useExpenses();
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) return <LoadingSpinner fullScreen />;

  const currentTotal = stats?.currentMonth?.total || 0;
  const lastTotal = stats?.lastMonth?.total || 0;
  const monthChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

  const pieData = (stats?.categoryBreakdown || []).map((c) => ({
    name: c._id,
    value: c.total,
    color: CATEGORY_COLORS[c._id] || '#6b7280',
  }));

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here&apos;s your financial overview for this month.</p>
        </div>
        <Link to="/expenses" className="btn-primary">+ Add Expense</Link>
      </div>

      <div className="stat-grid">
        <StatCard
          title="This Month"
          value={formatCurrency(currentTotal)}
          subtitle={`${stats?.currentMonth?.count || 0} transactions`}
          icon="💳"
          trend={monthChange}
          trendLabel="vs last month"
          color="blue"
        />
        <StatCard
          title="Last Month"
          value={formatCurrency(lastTotal)}
          subtitle={`${stats?.lastMonth?.count || 0} transactions`}
          icon="📅"
          color="green"
        />
        <StatCard
          title="Top Category"
          value={stats?.categoryBreakdown?.[0]?._id || '—'}
          subtitle={stats?.categoryBreakdown?.[0] ? formatCurrency(stats.categoryBreakdown[0].total) : 'No data'}
          icon="🏷"
          color="amber"
        />
        <StatCard
          title="Avg. Transaction"
          value={stats?.currentMonth?.count ? formatCurrency(currentTotal / stats.currentMonth.count) : '$0.00'}
          subtitle="This month"
          icon="⚡"
          color="rose"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Spending by Category</h3>
            <Link to="/analytics" className="card-link">View all →</Link>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No expenses this month</div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <Link to="/expenses" className="card-link">View all →</Link>
          </div>
          {(stats?.recentExpenses || []).length === 0 ? (
            <div className="empty-state-small">
              <p>No recent transactions</p>
              <Link to="/expenses" className="btn-primary sm">Add your first expense</Link>
            </div>
          ) : (
            <ul className="recent-list">
              {(stats?.recentExpenses || []).map((exp) => (
                <li key={exp._id} className="recent-item">
                  <div className="recent-icon" style={{ background: `${CATEGORY_COLORS[exp.category]}22`, color: CATEGORY_COLORS[exp.category] }}>
                    {getCategoryEmoji(exp.category)}
                  </div>
                  <div className="recent-info">
                    <span className="recent-title">{exp.title}</span>
                    <span className="recent-meta">{exp.category} · {formatDate(exp.date)}</span>
                  </div>
                  <span className="recent-amount">{formatCurrency(exp.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(stats?.categoryBreakdown || []).length > 0 && (
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Category Breakdown</h3>
          </div>
          <div className="category-bars">
            {stats.categoryBreakdown.map((cat) => {
              const pct = currentTotal > 0 ? (cat.total / currentTotal) * 100 : 0;
              return (
                <div key={cat._id} className="category-bar-row">
                  <div className="category-bar-label">
                    <span>{cat._id}</span>
                    <span>{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat._id] || '#6b7280' }}
                    />
                  </div>
                  <span className="category-bar-pct">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const getCategoryEmoji = (cat) => {
  const map = {
    'Food & Dining': '🍽', 'Transportation': '🚗', 'Shopping': '🛍',
    'Entertainment': '🎬', 'Bills & Utilities': '⚡', 'Health & Medical': '💊',
    'Travel': '✈', 'Education': '📚', 'Personal Care': '💆', 'Other': '📌',
  };
  return map[cat] || '📌';
};

export default Dashboard;
