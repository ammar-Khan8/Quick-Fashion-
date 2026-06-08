import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/postgres.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!JWT_SECRET || !REFRESH_SECRET) {
  console.error('Missing JWT_SECRET or REFRESH_SECRET environment variables. Add them to Backend/Expreserver/.env.');
  throw new Error('Missing JWT_SECRET or REFRESH_SECRET');
}
// shouldnt both refresh and access use diff secrets? yeah, its a good practice to use different secrets 
// for access and refresh tokens to enhance security.
// refreshes are used cz Access token expires quickly (user needs to refresh frequently)
const ACCESS_TOKEN_EXPIRES_IN = '2m'; // set short for testing; bump to '15m' or '1d' in production
const REFRESH_TOKEN_EXPIRES_IN = '7d';


// Create just the access token (short-lived JWT)
function createAccessToken(userId) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

// Create a refresh token (long-lived JWT used to get new access tokens when expired)
function createRefreshToken(userId) {
  if (!REFRESH_SECRET) {
    throw new Error('REFRESH_SECRET is not configured');
  }
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

// Hash the refresh token before storing in database
// This is a security practice: if the database is compromised, tokens are not exposed
// tell me more aboutcrypto library? crypto is a built-in Node.js module that provides
// cryptographic functionality, including hashing, encryption, and decryption. In this 
// case, we are using it to create a hash of the refresh token before storing it in the 
// database. This way, even if someone gains unauthorized access to the database, they 
// won't be able to see the actual refresh tokens, only their hashes. When a refresh 
// token is presented for validation, we can hash it and compare it to the stored hash 
// in the database to verify its authenticity without ever needing to store the plain 
// token itself. 
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// The refresh token is sent to the browser as an httpOnly cookie.
// httpOnly means JS running on the page CANNOT read it at all — even XSS can't steal it.
// The browser attaches the cookie automatically on every matching request.
const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // false on localhost (http), true in prod (https)
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/',
};

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);
}

function clearRefreshTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: 0 });
}

// Store refresh token in database with expiry date
async function storeRefreshToken(userId, refreshToken) {
  const tokenHash = hashRefreshToken(refreshToken); //calling the above defined func
  // Calculate expiry date based on the token's exp claim
  const decoded = jwt.decode(refreshToken); //decoding the refresh token to get its payload,
  // which includes the exp claim that indicates when the token expires.
  const expiresAt = new Date(decoded.exp * 1000); //is .exp a built in property of the decoded object? 
  // yes, when you decode a JWT, the resulting object will have properties corresponding to the claims
  // in the token's payload. The exp claim is a standard claim that represents the expiration time of 
  // the token as a Unix timestamp (number of seconds since January 1, 1970). So decoded.exp will give 
  // you that timestamp, and we multiply by 1000 to convert it to milliseconds for creating a 
  // JavaScript Date object. now if it were .abc that wouldnt be built in, thatd be a custom claim. .exp is
  // built in because its a standard claim defined in the JWT specification.

  //what is js date object? the Date object in JavaScript is a built-in object that represents a single moment 
  //in time. It provides methods for working with dates and times, such as getting the current date, 
  //formatting dates, and performing date arithmetic. can we not directly get date?

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
    [email]
  );
  // u may be asking what $1 is here, its a parameterized query syntax used in PostgreSQL
  // to prevent SQL injection.
  return result.rows[0];
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body; //destructuring the name, email, and password from the 
    // request body, which is expected to be in JSON format. so now the vars name, email, and password
    // will hold the values sent by the client in the request body when they try to register a new user.

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12); //kind of high maybe
    const insert = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash] // we are inserting a new user into the users table with the
      //provided name, email, and hashed password.
    );

    const user = insert.rows[0]; //anywhere u see rows[0] is from supabase its not an sql thing its 
    // just how supabase returns data. anyway, this line is taking the first row of the result from
    // the insert query, which should contain the newly created user's information (id, name, email,
    // created_at) and storing it in the user variable. it will also return id, name, email, 
    // created_at because of the RETURNING clause in the SQL query.

    // Create access token (short-lived, used for API requests)
    const accessToken = createAccessToken(user.id);

    // Create refresh token (long-lived, used to get new access tokens when expired)
    const refreshToken = createRefreshToken(user.id);

    // Store hashed refresh token in the database
    await storeRefreshToken(user.id, refreshToken);

    // Send the refresh token as an httpOnly cookie — it never goes in the JSON body.
    // JS on the page cannot access httpOnly cookies at all.
    setRefreshTokenCookie(res, refreshToken);

    // Only the access token goes in the response body.
    return res.status(201).json({
      user,
      accessToken
    });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create access token (short-lived, used for API requests)
    const accessToken = createAccessToken(user.id);

    // Create refresh token (long-lived, used to get new access tokens when expired)
    const refreshToken = createRefreshToken(user.id);

    // Store hashed refresh token in the database
    await storeRefreshToken(user.id, refreshToken);

    // Send the refresh token as an httpOnly cookie — never in the JSON body
    setRefreshTokenCookie(res, refreshToken);

    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken
    });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user?.id; //the ? is optional chaining, it checks if req.user exists
    // before trying to access .id.
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// Handle refresh token requests to get a new access token.
// The browser sends the httpOnly refreshToken cookie automatically.
// In dev, Vite's proxy sometimes strips Cookie headers when forwarding
// requests to Express, so we also accept the expired access token from the
// Authorization header as a fallback to identify the user.
export async function refreshAccessToken(req, res) {
  try {
    let userId;

    // ── Primary path: httpOnly cookie (correct in production) ──────────────
    const cookieToken = req.cookies[COOKIE_NAME];
    if (cookieToken) {
      let payload;
      try {
        payload = jwt.verify(cookieToken, REFRESH_SECRET);
      } catch (err) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: 'Invalid or expired refresh token.' });
      }

      // Confirm this exact token exists in the DB and is not revoked
      const tokenHash = hashRefreshToken(cookieToken);
      const storedToken = await pool.query(
        'SELECT id, expires_at FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked = FALSE',
        [payload.userId, tokenHash]
      );

      if (!storedToken.rows.length) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: 'Refresh token not found or has been revoked.' });
      }
      if (new Date() > new Date(storedToken.rows[0].expires_at)) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: 'Refresh token has expired.' });
      }

      // Rotate the specific token we just validated
      await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [storedToken.rows[0].id]);
      userId = payload.userId;

    // ── Fallback: expired Bearer token (dev / Vite proxy) ──────────────────
    // The refresh token itself never leaves the backend. We only use the
    // expired access token to identify the user (jwt.decode ignores expiry).
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      const expiredToken = req.headers.authorization.split(' ')[1];
      const decoded = jwt.decode(expiredToken); // decode only — expiry intentionally ignored
      if (!decoded?.userId) {
        return res.status(401).json({ error: 'Cannot identify user. Please log in again.' });
      }

      // Find the most recent valid refresh record for this user
      const storedToken = await pool.query(
        `SELECT id, expires_at
         FROM refresh_tokens
         WHERE user_id = $1 AND revoked = FALSE
         ORDER BY created_at DESC
         LIMIT 1`,
        [decoded.userId]
      );

      if (!storedToken.rows.length) {
        return res.status(401).json({ error: 'No active session found. Please log in again.' });
      }
      if (new Date() > new Date(storedToken.rows[0].expires_at)) {
        return res.status(401).json({ error: 'Session has expired. Please log in again.' });
      }

      // Rotate
      await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [storedToken.rows[0].id]);
      userId = decoded.userId;

    } else {
      return res.status(401).json({ error: 'No refresh credentials provided. Please log in again.' });
    }

    // ── Issue fresh tokens ──────────────────────────────────────────────────
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);
    await storeRefreshToken(userId, newRefreshToken);

    // Always set the new cookie (cookie path: httpOnly for production security)
    setRefreshTokenCookie(res, newRefreshToken);

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function logoutUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Revoke all refresh tokens for this user in the DB
    await pool.query(
      'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1',
      [userId]
    );

    // Clear the httpOnly cookie from the browser
    clearRefreshTokenCookie(res);

    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('logoutUser error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
