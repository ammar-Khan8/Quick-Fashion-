import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/postgres.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
// shouldnt both refresh and access use diff secrets? yeah, its a good practice to use different secrets 
// for access and refresh tokens to enhance security.
// refreshes are used cz Access token expires quickly (user needs to refresh frequently)
const ACCESS_TOKEN_EXPIRES_IN = '15m'; //eh? cant i keep em logged in 1 day since this a shopping 
// app? yeah you can, but shorter expiration times for access tokens are generally recommended 
// for better security. Refresh token lasts longer (keeps user logged in without re-entering credentials)
const REFRESH_TOKEN_EXPIRES_IN = '7d';


// Create just the access token (short-lived JWT)
function createAccessToken(userId) {//we are defining this function 2 be used later
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

// Create a refresh token (long-lived JWT used to get new access tokens)
function createRefreshToken(userId) {
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
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
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
    
    // Store refresh token in database so we can validate it later
    await storeRefreshToken(user.id, refreshToken); //why is storing an async op? shouldnt
    //it be instant? storing the refresh token involves inserting a record into the database, which is an
    //asynchronous operation because it may take some time to complete, especially if the database is 
    //under load or if there are network delays. By using async/await, we can ensure that we wait for the 
    //database operation to finish before proceeding to send the response back to the client. If we didn't
    //await this operation, we might send the response before the refresh token is actually stored in the database,
    //which could lead to issues when the client tries to use that refresh token later on.

    return res.status(201).json({ 
      user, 
      accessToken,
      refreshToken 
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
    
    // Store refresh token in database so we can validate it later
    await storeRefreshToken(user.id, refreshToken);
    
    return res.json({ 
      user: { id: user.id, name: user.name, email: user.email }, 
      accessToken,
      refreshToken 
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
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
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

// Handle refresh token requests to get a new access token
export async function refreshAccessToken(req, res) {
  try {
    // Client sends refresh token in request body
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    // Verify the refresh token's signature
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const userId = payload.userId;

    // Check if this refresh token exists in the database and is not revoked
    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await pool.query(
      'SELECT id, revoked, expires_at FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked = FALSE',
      [userId, tokenHash]
    );

    if (!storedToken.rows.length) {
      return res.status(401).json({ error: 'Refresh token not found or has been revoked.' });
    }

    // Check if token has expired
    const tokenRecord = storedToken.rows[0];
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return res.status(401).json({ error: 'Refresh token has expired.' });
    }

    // Issue a new access token
    const newAccessToken = createAccessToken(userId);

    // Optionally: issue a new refresh token too (refresh token rotation for extra security)
    const newRefreshToken = createRefreshToken(userId);
    await storeRefreshToken(userId, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
