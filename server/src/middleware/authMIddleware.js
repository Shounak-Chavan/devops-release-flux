// server/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

/**
 * Middleware to authenticate incoming requests using JSON Web Tokens (JWT).
 * Extracts the token from the Authorization header, verifies its validity,
 * and attaches the decoded user payload to the request object so subsequent 
 * controllers know exactly which SaaS tenant is making the request.
 *
 * @function requireAuth
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void|Object} Calls next() if authenticated, otherwise returns a 401 response.
 */
export const requireAuth = (req, res, next) => {
  // 1. Extract the token from the Authorization header
  // Note: While the project document mentions HTTP-only cookies for the dashboard[cite: 134, 135], 
  // standard SaaS APIs often expect the Bearer token in the header for cross-platform compatibility. 
  // You can easily adapt this to read from req.cookies.token if you implement a cookie parser.
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Token missing or invalid format.' });
  }

  // 2. Isolate the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Attach the decoded payload (which contains our userId) to the request object
    req.user = decoded;
    
    // 5. Pass control to the next middleware or the actual route controller
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    
    // Differentiate between expired tokens and malformed tokens for better client-side UX
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    
    return res.status(401).json({ error: 'Invalid or malformed token.' });
  }
};