import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
        <h1 className="auth-tagline">Start your financial journey</h1>
        <p className="auth-subtitle">Join thousands of users who track smarter and spend wiser.</p>
        <div className="auth-features">
          <div className="auth-feature"><span>✓</span> Free to use, no credit card</div>
          <div className="auth-feature"><span>✓</span> Secure & private</div>
          <div className="auth-feature"><span>✓</span> Smart spending insights</div>
          <div className="auth-feature"><span>✓</span> Works on all devices</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Get started for free today.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text" value={form.name}
                onChange={handleChange} placeholder="John Doe"
                autoComplete="name" maxLength={50} required
              />
            </div>

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
                onChange={handleChange} placeholder="Min. 6 characters"
                autoComplete="new-password" minLength={6} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm" name="confirm" type="password" value={form.confirm}
                onChange={handleChange} placeholder="Repeat your password"
                autoComplete="new-password" required
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
