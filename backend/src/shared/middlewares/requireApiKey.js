import { supabase } from '../../config/supabase.js';

/**
 * Middleware to authenticate SDK requests using a Project API Key.
 * Validates the key against the database and attaches the project ID to the request.
 * @async
 * @function requireApiKey
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export const requireApiKey = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ff_live_')) {
            return res.status(401).json({ error: 'Missing or invalid API Key.' });
        }

        const apiKey = authHeader.split(' ')[1];

        // Lookup the project by API key
        const { data: project, error } = await supabase
            .from('projects')
            .select('id')
            .eq('api_key', apiKey)
            .single();

        if (error || !project) {
            return res.status(401).json({ error: 'Unauthorized: Invalid API Key.' });
        }

        // Attach the project ID to the request so the controller knows which flags to fetch
        req.projectId = project.id;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during API Key validation.' });
    }
};