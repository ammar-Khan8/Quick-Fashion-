import jwt from 'jsonwebtoken';

//is this page for authorization or authentication?
//This page is for authentication, it checks if the user is authenticated by 
//verifying the JWT token in the request header.
//why is it not authorization?
//Authorization is about checking if the authenticated user has permission to access a specific resource
//or perform a specific action. This middleware only checks if the user is authenticated, it does not 
//check for any permissions or roles.
const JWT_SECRET = process.env.JWT_SECRET;

export default function authMiddleware(req, res, next) {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header.' });
  }

  const token = authHeader.split(' ')[1]; //extracting only the token part from the header, which is 
  // in the format "Bearer <token>", and those 2 words Bearer and token are a string so we split by 
  // space and take the second part which is the token itself. split() is used on strings

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.userId }; //is .user a built in property of the request object? 
    // no, we are adding it ourselves to store the user information from the token payload.
    // is .userId a built in property of the payload object?
    // no, we are assuming that when the token was created, it included a userId field in its payload. 
    // This is a common practice to identify the user associated with the token.
    return next(); //heres the next
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
