import { supabase } from '../../config/supabase.js';

/**
 * Creates a new feature flag under a specific project.
 * @async
 * @function createFlag
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const createFlag = async (req, res) => {
    try {
        const { projectId, name, description } = req.body;

        if (!projectId || !name?.trim()) {
            return res.status(400).json({ error: 'Project ID and Flag name are required.' });
        }

        const { data, error } = await supabase
            .from('feature_flags')
            .insert([{ project_id: projectId, name: name.trim(), description }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Feature flag created successfully', data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create flag.' });
    }
};

/**
 * Retrieves all feature flags for a specific project.
 * @async
 * @function getFlagsByProject
 */
export const getFlagsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { data, error } = await supabase
            .from('feature_flags')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch flags.' });
    }
};

/**
 * Toggles a flag ON or OFF and records the change in the Audit Log.
 * @async
 * @function toggleFlag
 */
export const toggleFlag = async (req, res) => {
    try {
        const { flagId } = req.params;
        const userId = req.user.id; // From requireAuth middleware

        // 1. Fetch the current flag state
        const { data: currentFlag, error: fetchError } = await supabase
            .from('feature_flags')
            .select('*')
            .eq('id', flagId)
            .single();

        if (fetchError || !currentFlag) {
            return res.status(404).json({ error: 'Feature flag not found.' });
        }

        const newState = !currentFlag.status;
        const actionText = newState ? 'TOGGLED_ON' : 'TOGGLED_OFF';

        // 2. Update the flag status
        const { data: updatedFlag, error: updateError } = await supabase
            .from('feature_flags')
            .update({ status: newState, updated_at: new Date().toISOString() })
            .eq('id', flagId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Write to the Audit Log
        const { error: auditError } = await supabase
            .from('audit_logs')
            .insert([{
                flag_id: flagId,
                user_id: userId,
                action: actionText,
                previous_state: { status: currentFlag.status },
                new_state: { status: newState }
            }]);

        if (auditError) console.error('Audit Log Error:', auditError); // Log it, but don't fail the request

        res.status(200).json({ message: `Flag ${actionText}`, data: updatedFlag });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to toggle flag.' });
    }
};