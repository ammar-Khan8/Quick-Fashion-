import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); //prevents default form submission behavior which would cause a page reload
    //i dont rly get it tho
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // store access token (backend returns `accessToken`) under `token` for existing code
      // The refresh token is set as an httpOnly cookie by the backend — the frontend
      // never sees it, which is the correct security practice.
      const accessToken = data.accessToken || data.token;
      if (accessToken) localStorage.setItem('token', accessToken);

      // notify other parts of the app that auth changed
      window.dispatchEvent(new Event('authChange'));

      const resolvedUsername = data.username || data.user?.username || data.user?.name || email;
      if (resolvedUsername) {
        localStorage.setItem('username', resolvedUsername);
      }
      navigate('/profile');
    } catch (fetchError) {
      setError('Unable to reach server.');
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
