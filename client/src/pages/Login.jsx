import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo-icon">💰</span>
          <span className="auth-logo-text">ExpenseIQ</span>
        </div>
        <h1 className="auth-tagline">Take control of your finances</h1>
        <p className="auth-subtitle">Track spending, visualize trends, and reach your financial goals.</p>
        <div className="auth-features">
          <div className="auth-feature"><span>✓</span> Real-time expense tracking</div>
          <div className="auth-feature"><span>✓</span> Visual analytics & charts</div>
          <div className="auth-feature"><span>✓</span> Category breakdown</div>
          <div className="auth-feature"><span>✓</span> Monthly budget overview</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign in</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                autoComplete="email" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="••••••••"
                autoComplete="current-password" required
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
