import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, trend, trendLabel, color = 'blue' }) => {
  const isPositiveTrend = trend > 0;

  return (
    <div className={`stat-card stat-card-₹{color}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{icon}</div>
        {trend !== undefined && (
          <div className={`stat-trend ₹{isPositiveTrend ? 'trend-up' : 'trend-down'}`}>
            <span>{isPositiveTrend ? '↑' : '↓'}</span>
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {trendLabel && <p className="stat-trend-label">{trendLabel}</p>}
      </div>
    </div>
  );
};

export default StatCard;
