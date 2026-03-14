import { supabase } from '../../config/supabase.js';
import crypto from 'crypto';

/**
 * Creates a new project for the authenticated user and generates an API key.
 * * @async
 * @function createProject
 * @param {import('express').Request} req - The Express request object containing the project name.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the created project data.
 */
export const createProject = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id; // Comes from requireAuth middleware

        if (!name?.trim()) {
            return res.status(400).json({ error: 'Project name is required.' });
        }

        // Generate a secure, unique API key for this project
        const apiKey = `ff_live_${crypto.randomBytes(16).toString('hex')}`;

        // Insert into the database
        const { data, error } = await supabase
            .from('projects')
            .insert([{ owner_id: userId, name: name.trim(), api_key: apiKey }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Project created successfully', data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create project.' });
    }
};

/**
 * Retrieves all projects owned by the authenticated user.
 * * @async
 * @function getProjects
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of projects.
 */
export const getProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch projects.' });
    }
};