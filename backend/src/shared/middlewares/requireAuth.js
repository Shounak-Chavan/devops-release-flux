import { supabase } from '../../config/supabase.js';

/**
 * Middleware to protect routes by verifying the Supabase JWT token.
 * Extracts the token from the Authorization header and fetches the user.
 * * @async
 * @function requireAuth
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>} Calls next() if authenticated, or returns a 401/403 error response.
 */
export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
        }

        // Attach the authenticated user to the request object for downstream controllers
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};