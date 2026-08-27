import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = ({ initialMode = 'signin' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from prop or pathname
  const defaultTab = location.pathname === '/register' ? 'register' : initialMode;
  const [mode, setMode] = useState(defaultTab);

  // Sign In state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siError, setSiError] = useState('');
  const [siLoading, setSiLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [rgName, setRgName] = useState('');
  const [rgEmail, setRgEmail] = useState('');
  const [rgPassword, setRgPassword] = useState('');
  const [rgConfirm, setRgConfirm] = useState('');
  const [rgError, setRgError] = useState('');
  const [rgLoading, setRgLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSiError('');
    setSiLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: siEmail, password: siPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSiError(data.error || 'Invalid email or password. Please try again.');
        setSiLoading(false);
        return;
      }

      const accessToken = data.accessToken || data.token;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }

      const resolvedUsername = data.username || data.user?.name || data.user?.username || siEmail;
      if (resolvedUsername) {
        localStorage.setItem('username', resolvedUsername);
      }

      window.dispatchEvent(new Event('authChange'));
      navigate('/profile');
    } catch (err) {
      setSiError('Unable to reach server. Please check your connection.');
    } finally {
      setSiLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRgError('');

    if (rgPassword !== rgConfirm) {
      setRgError("Passwords don't match. Please re-enter.");
      return;
    }

    if (rgPassword.length < 8) {
      setRgError("Password must be at least 8 characters.");
      return;
    }

    setRgLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rgName, email: rgEmail, password: rgPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRgError(data.error || 'Registration failed. Please try again.');
        setRgLoading(false);
        return;
      }

      const accessToken = data.accessToken || data.token;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }

      const resolvedUsername = data.user?.name || rgName || rgEmail;
      if (resolvedUsername) {
        localStorage.setItem('username', resolvedUsername);
      }

      window.dispatchEvent(new Event('authChange'));
      navigate('/profile');
    } catch (err) {
      setRgError('Unable to reach server. Please check your connection.');
    } finally {
      setRgLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {/* LEFT — Editorial panel */}
      <div className="shell-left">
        <div className="shell-figure"></div>
        <div className="shell-ring"></div>
        <div className="shell-eyebrow">Member Access</div>
        <h1 className="shell-title">
          Welcome to a <em>considered</em> way of dressing.
        </h1>
        <p className="shell-quote">
          Sign in for early access to new arrivals, saved favourites, and order tracking — built for those who dress with intention.
        </p>
      </div>

      {/* RIGHT — Form panel */}
      <div className="shell-right">
        <div className="form-wrap">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => setMode('signin')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Create Account
            </button>
          </div>

          {/* SIGN IN PANEL */}
          <div className={`panel ${mode === 'signin' ? 'active' : ''}`}>
            <div className="form-eyebrow">Returning Client</div>
            <h2 className="form-title">
              Sign <em>In</em>
            </h2>

            <form onSubmit={handleSignIn}>
              <div className="field">
                <label htmlFor="si-email">Email</label>
                <input
                  type="email"
                  id="si-email"
                  placeholder="you@example.com"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="si-password">Password</label>
                <input
                  type="password"
                  id="si-password"
                  placeholder="••••••••"
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className={`error-msg ${siError ? 'show' : ''}`}>
                {siError}
              </div>

              <div className="field-row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="link-quiet">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn-primary" disabled={siLoading}>
                {siLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="divider">
              <span>Or</span>
            </div>

            <button type="button" className="btn-outline">
              Continue with Google
            </button>
            <button type="button" className="btn-outline">
              Continue with Apple
            </button>

            <p className="switch-line">
              New to Maison?{' '}
              <button type="button" onClick={() => setMode('register')}>
                Create an account
              </button>
            </p>
          </div>

          {/* REGISTER PANEL */}
          <div className={`panel ${mode === 'register' ? 'active' : ''}`}>
            <div className="form-eyebrow">New Client</div>
            <h2 className="form-title">
              Create <em>Account</em>
            </h2>

            <form onSubmit={handleRegister}>
              <div className="field">
                <label htmlFor="rg-name">Full Name</label>
                <input
                  type="text"
                  id="rg-name"
                  placeholder="Jordan Ellis"
                  value={rgName}
                  onChange={(e) => setRgName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="rg-email">Email</label>
                <input
                  type="email"
                  id="rg-email"
                  placeholder="you@example.com"
                  value={rgEmail}
                  onChange={(e) => setRgEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="rg-password">Password</label>
                <input
                  type="password"
                  id="rg-password"
                  placeholder="At least 8 characters"
                  value={rgPassword}
                  onChange={(e) => setRgPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="field">
                <label htmlFor="rg-confirm">Confirm Password</label>
                <input
                  type="password"
                  id="rg-confirm"
                  placeholder="••••••••"
                  value={rgConfirm}
                  onChange={(e) => setRgConfirm(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className={`error-msg ${rgError ? 'show' : ''}`}>
                {rgError}
              </div>

              <button type="submit" className="btn-primary" disabled={rgLoading}>
                {rgLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="terms">
              By creating an account you agree to Maison's{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              .
            </p>

            <p className="switch-line">
              Already a client?{' '}
              <button type="button" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
