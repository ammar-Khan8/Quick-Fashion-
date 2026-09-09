import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';

let refreshPromise = null;

// Helper: ask the backend for a new access token.
// We use a `refreshPromise` lock to prevent race conditions. If React Strict Mode
// (or multiple components) triggers two concurrent 401s, we only want ONE request
// to go to the backend. The second request will just await the first one's result.
async function tryRefreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const expiredToken = localStorage.getItem('token');
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: expiredToken
          ? { Authorization: `Bearer ${expiredToken}` }
          : {},
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.accessToken || null;
    } catch (err) {
      console.error('Refresh failed:', err);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(username || localStorage.getItem('username') || 'Guest');
  const [loading, setLoading] = useState(true);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // First attempt: use the access token we already have in localStorage
        let res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If the access token is expired (401), try to get a new one using the
        // refresh-token httpOnly cookie (the browser sends it automatically).
        if (res.status === 401) {
          const newAccessToken = await tryRefreshAccessToken();

          if (!newAccessToken) {
            // Refresh also failed — the user's session is truly over. Log them out.
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.dispatchEvent(new Event('authChange'));
            setDisplayName('Guest');
            setLoading(false);
            return;
          }

          // Save the fresh access token and retry the profile request
          localStorage.setItem('token', newAccessToken);
          res = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${newAccessToken}` },
          });
        }

        if (!res.ok) {
          // Some other error (404, 500, …) — just clear auth and show guest state
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.dispatchEvent(new Event('authChange'));
          setDisplayName('Guest');
          setLoading(false);
          return;
        }

        const data = await res.json();
        const name = data?.user?.name || localStorage.getItem('username') || 'Guest';
        setDisplayName(name);
        localStorage.setItem('username', name);
      } catch (err) {
        console.error('Profile fetch error', err);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event('authChange'));
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const handleLogout = async () => {
    setLogoutError('');
    try {
      const token = localStorage.getItem('token');
      // Tell the backend to revoke all refresh tokens for this user in the DB
      // and clear the httpOnly cookie server-side.
      // credentials: 'include' ensures the cookie is sent so the backend can clear it.
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      // Even if the network call fails, clear client-side auth so the user is
      // not stuck in a logged-in state with a dead token.
      console.error('Logout error:', err);
    }

    // Always clear client-side auth state
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="auth-page">
        <h1>Profile Page</h1>
        <p>You must be signed in to view this page.</p>
        <Link to="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Viewing user: {displayName}</p>
      {logoutError && <p className="form-error">{logoutError}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
