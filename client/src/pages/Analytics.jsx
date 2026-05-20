import { useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import './Analytics.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = {
  'Food & Dining': '#3b82f6', 'Transportation': '#10b981', 'Shopping': '#f59e0b',
  'Entertainment': '#8b5cf6', 'Bills & Utilities': '#ef4444', 'Health & Medical': '#06b6d4',
  'Travel': '#f97316', 'Education': '#84cc16', 'Personal Care': '#ec4899', 'Other': '#6b7280',
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { stats, fetchStats, loading } = useExpenses();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading && !stats) return <LoadingSpinner fullScreen />;

  const monthlyData = (stats?.monthlyTrend || []).map((m) => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    total: m.total,
    count: m.count,
  }));

  const pieData = (stats?.categoryBreakdown || []).map((c) => ({
    name: c._id,
    value: c.total,
    color: CATEGORY_COLORS[c._id] || '#6b7280',
  }));

  const totalCurrent = stats?.currentMonth?.total || 0;
  const totalLast = stats?.lastMonth?.total || 0;
  const change = totalLast > 0 ? ((totalCurrent - totalLast) / totalLast) * 100 : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visualize your spending patterns and trends.</p>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="analytics-stat">
          <span className="analytics-stat-label">This Month</span>
          <span className="analytics-stat-value">{formatCurrency(totalCurrent)}</span>
        </div>
        <div className="analytics-divider" />
        <div className="analytics-stat">
          <span className="analytics-stat-label">Last Month</span>
          <span className="analytics-stat-value">{formatCurrency(totalLast)}</span>
        </div>
        <div className="analytics-divider" />
        <div className="analytics-stat">
          <span className="analytics-stat-label">Change</span>
          <span className={`analytics-stat-value ${change > 0 ? 'trend-up' : 'trend-down'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        </div>
        <div className="analytics-divider" />
        <div className="analytics-stat">
          <span className="analytics-stat-label">Transactions</span>
          <span className="analytics-stat-value">{stats?.currentMonth?.count || 0}</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card full-width">
          <h3 className="chart-title">Monthly Spending Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">Not enough data to display</div>
          )}
        </div>

        <div className="analytics-card full-width">
          <h3 className="chart-title">Spending Line Trend</h3>
          {monthlyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Total Spent" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">Not enough data to display a trend</div>
          )}
        </div>

        <div className="analytics-card">
          <h3 className="chart-title">Category Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data this month</div>
          )}
        </div>

        <div className="analytics-card">
          <h3 className="chart-title">Top Categories</h3>
          {(stats?.categoryBreakdown || []).length > 0 ? (
            <div className="category-list">
              {stats.categoryBreakdown.map((cat, i) => {
                const pct = totalCurrent > 0 ? (cat.total / totalCurrent) * 100 : 0;
                return (
                  <div key={cat._id} className="cat-list-item">
                    <div className="cat-rank">{i + 1}</div>
                    <div className="cat-info">
                      <div className="cat-name-row">
                        <span className="cat-name">{cat._id}</span>
                        <span className="cat-amount">{formatCurrency(cat.total)}</span>
                      </div>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat._id] || '#6b7280' }} />
                      </div>
                      <span className="cat-pct">{pct.toFixed(1)}% of total · {cat.count} transaction{cat.count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-chart">No expenses this month</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
