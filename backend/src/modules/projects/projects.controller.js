import { supabase } from '../../config/supabase.js';
import { redis } from '../../config/redis.js';
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
 * Deletes a project and all its associated flags, rules, and audit logs.
 * Also clears any Redis caches tied to the project.
 * @async
 * @function deleteProject
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        // 1. Verify the project belongs to the requesting user
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('id, api_key')
            .eq('id', projectId)
            .eq('owner_id', userId)
            .single();

        if (fetchError || !project) {
            return res.status(403).json({ error: 'Project not found or access denied.' });
        }

        // 2. Delete the project (cascades to feature_flags, targeting_rules, audit_logs)
        const { error: deleteError } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (deleteError) throw deleteError;

        // 3. Clear Redis caches for this project
        await redis.del(`project_flags_rules:${projectId}`);
        await redis.del(`apikey:${project.api_key}`);

        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete project.' });
    }
};

/**
 * Rotates the API key for a project, generating a new secure key.
 * Clears the old key from the Redis cache.
 * @async
 * @function rotateApiKey
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const rotateApiKey = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        // 1. Verify ownership and fetch the old API key
        const { data: project, error: fetchError } = await supabase
            .from('projects')
            .select('id, api_key')
            .eq('id', projectId)
            .eq('owner_id', userId)
            .single();

        if (fetchError || !project) {
            return res.status(403).json({ error: 'Project not found or access denied.' });
        }

        // 2. Generate a new API key
        const newApiKey = `ff_live_${crypto.randomBytes(16).toString('hex')}`;

        // 3. Update the project with the new key
        const { data: updatedProject, error: updateError } = await supabase
            .from('projects')
            .update({ api_key: newApiKey })
            .eq('id', projectId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 4. Evict the old API key from Redis cache
        await redis.del(`apikey:${project.api_key}`);

        res.status(200).json({ message: 'API key rotated successfully.', data: updatedProject });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to rotate API key.' });
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