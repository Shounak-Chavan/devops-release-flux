import { supabase } from '../../config/supabase.js';

export const requireApiKey = async (req, res, next) => {
    try {
        // 1. Look for the key in the Authorization header FIRST
        let apiKey;
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            apiKey = authHeader.split(' ')[1];
        } 
        // 2. Fallback: Look in the query string (Crucial for Server-Sent Events!)
        else if (req.query.apiKey) {
            apiKey = req.query.apiKey;
        }

        // 3. If still no key, reject
        if (!apiKey) {
            return res.status(401).json({ error: 'API key is missing.' });
        }

        // 4. Validate the key against the database
        const { data: project, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('api_key', apiKey)
            .single();

        if (error || !project) {
            return res.status(401).json({ error: 'Invalid API key.' });
        }

        // 5. Attach the project to the request so the controller can use it
        req.project = project;
        next();
        
    } catch (err) {
        console.error('API Key Middleware Error:', err);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};