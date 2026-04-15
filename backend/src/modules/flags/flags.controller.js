import { queue } from '../../config/queue.js';
import { redis } from '../../config/redis.js';
import { supabase } from '../../config/supabase.js';
import { sendEmailNotification } from '../../shared/utils/mailer.js';
import { getEnvironmentRuleset } from '../sdk/sdk.controller.js';


/**
 * Helper to invalidate cache, fetch fresh rules, and push to connected SDKs via SSE.
 * Implements Stale-While-Revalidate pattern to prevent cache stampedes.
 */
export const pushRulesetUpdate = async (projectId) => {
    try {
        // 1. CRITICAL: Invalidate the old cache!
        await redis.del(`project_flags_rules:${projectId}`);

        // 2. Fetch the newly updated ruleset (this will repopulate the cache)
        const freshRuleset = await getEnvironmentRuleset(projectId);

        // 3. Format exactly as the React SDK expects
        const payload = JSON.stringify({
            type: 'RULESET_UPDATED',
            data: freshRuleset
        });

        // 4. Publish to the Redis channel
        await redis.publish(`project_updates:${projectId}`, payload);
        
        console.log(`[Pub/Sub] Broadcasted ruleset update for project: ${projectId}`);
    } catch (error) {
        console.error(`[Pub/Sub] Failed to push update for ${projectId}:`, error);
    }
};

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
        const userId = req.user.id;
        
        console.log("pass1");

        // 1. Fetch the current flag state
        const { data: currentFlag, error: fetchError } = await supabase
            .from('feature_flags')
            .select('*')
            .eq('id', flagId)
            .single();

        if (fetchError || !currentFlag) {
            return res.status(404).json({ error: 'Feature flag not found.' });
        }

        console.log("pass2");

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

        console.log("pass3");

        // FIX: Use updatedFlag.project_id instead of flag.project_id
        await pushRulesetUpdate(updatedFlag.project_id);

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

        if (auditError) console.error('Audit Log Error:', auditError); 

        console.log("pass4");

        // Send email notification
        const userEmail = req.user.email;
        await sendEmailNotification(
            userEmail,
            `Flag Toggled: ${currentFlag.name}`,
            `<p>Your feature flag <strong>${currentFlag.name}</strong> was manually toggled to <strong>${newState ? 'ON' : 'OFF'}</strong>.</p>`
        );

        console.log("pass5");

        res.status(200).json({ message: `Flag ${actionText}`, updatedFlag });
    } catch (error) {
        console.error("Toggle Flag Error:", error);
        res.status(500).json({ error: error.message || 'Failed to toggle flag.' });
    }
};

/**
 * Adds a new targeting rule to a specific feature flag.
 * @async
 * @function addTargetingRule
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const addTargetingRule = async (req, res) => {
    try {
        const { flagId } = req.params;
        const { attribute, operator, value, rolloutPercentage } = req.body;

        // 1. Verify flag exists and grab the project_id for cache invalidation
        const { data: flag, error: flagError } = await supabase
            .from('feature_flags')
            .select('project_id')
            .eq('id', flagId)
            .single();

        if (flagError || !flag) {
            return res.status(404).json({ error: 'Feature flag not found.' });
        }

        // 2. Insert the targeting rule
        const { data: rule, error: ruleError } = await supabase
            .from('targeting_rules')
            .insert([{
                flag_id: flagId,
                attribute,
                operator,
                value,
                rollout_percentage: rolloutPercentage !== undefined ? rolloutPercentage : 100
            }])
            .select()
            .single();

        if (ruleError) throw ruleError;

        await pushRulesetUpdate(flag.project_id);


        res.status(201).json({ message: 'Targeting rule added successfully', data: rule });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to add targeting rule.' });
    }
};

/**
 * Removes a targeting rule from a feature flag.
 * @async
 * @function removeTargetingRule
 */
export const removeTargetingRule = async (req, res) => {
    try {
        const { flagId, ruleId } = req.params;

        // 1. Get project_id for cache invalidation before deleting
        const { data: flag, error: flagError } = await supabase
            .from('feature_flags')
            .select('project_id')
            .eq('id', flagId)
            .single();

        if (flagError || !flag) return res.status(404).json({ error: 'Flag not found.' });

        // 2. Delete the rule
        const { error: deleteError } = await supabase
            .from('targeting_rules')
            .delete()
            .match({ id: ruleId, flag_id: flagId });

        if (deleteError) throw deleteError;

        await pushRulesetUpdate(flag.project_id);


        res.status(200).json({ message: 'Targeting rule removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to remove targeting rule.' });
    }
};


/**
 * Reverts a feature flag to its previous state using the most recent audit log entry.
 * @async
 * @function rollbackFlag
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const rollbackFlag = async (req, res) => {
    try {
        const { flagId } = req.params;
        const userId = req.user.id;

        // 1. Fetch the most recent audit log entry for this flag
        const { data: latestLog, error: logError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('flag_id', flagId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (logError || !latestLog) {
            return res.status(404).json({ error: 'No audit history found to rollback.' });
        }

        if (!latestLog.previous_state || latestLog.previous_state.status === undefined) {
            return res.status(400).json({ error: 'Cannot rollback: previous state is unknown.' });
        }

        const targetStatus = latestLog.previous_state.status;

        // 2. Fetch the project_id for cache invalidation
        const { data: flag, error: flagError } = await supabase
            .from('feature_flags')
            .select('project_id, status')
            .eq('id', flagId)
            .single();

        if (flagError || !flag) return res.status(404).json({ error: 'Flag not found.' });

        if (flag.status === targetStatus) {
            return res.status(400).json({ message: 'Flag is already in the target state.' });
        }

        // 3. Update the flag back to its previous state
        const { data: updatedFlag, error: updateError } = await supabase
            .from('feature_flags')
            .update({ status: targetStatus, updated_at: new Date().toISOString() })
            .eq('id', flagId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 4. Write a new entry to the Audit Log marking this as a ROLLBACK
        await supabase.from('audit_logs').insert([{
            flag_id: flagId,
            user_id: userId,
            action: 'ROLLBACK',
            previous_state: { status: flag.status },
            new_state: { status: targetStatus }
        }]);


        await pushRulesetUpdate(flag.project_id);

        // Send email notification
        const userEmail = req.user.email;
        await sendEmailNotification(
            userEmail,
            `Rollback Performed`,
            `<p>A rollback was performed. A flag was restored to <strong>${targetStatus ? 'ON' : 'OFF'}</strong>.</p>`
        );

        res.status(200).json({ message: 'Rollback successful', data: updatedFlag });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to rollback flag.' });
    }
};

/**
 * Schedules a flag to toggle at a specific future date and time.
 * @async
 * @function scheduleFlagToggle
 */
export const scheduleFlagToggle = async (req, res) => {
    try {
        const { flagId } = req.params;
        const { targetStatus, scheduledTime } = req.body; // scheduledTime should be an ISO string
        const userId = req.user.id;

        if (typeof targetStatus !== 'boolean' || !scheduledTime) {
            return res.status(400).json({ error: 'targetStatus (boolean) and scheduledTime (ISO string) are required.' });
        }

        const date = new Date(scheduledTime);
        if (date <= new Date()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future.' });
        }

        // Send the job to pg-boss with the startAfter configuration
        const userEmail = req.user.email;
        const jobId = await queue.send('toggle-flag', 
            { flagId, targetStatus, userId , userEmail }, 
            { startAfter: date }
        );

        res.status(202).json({ 
            message: `Flag toggle scheduled successfully for ${date.toLocaleString()}`, 
            jobId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to schedule flag.' });
    }
};

/**
 * Retrieves a single feature flag and its targeting rules.
 * @async
 * @function getFlagById
 */
export const getFlagById = async (req, res) => {
    try {
        const { flagId } = req.params;

        const { data, error } = await supabase
            .from('feature_flags')
            .select(`
                *,
                targeting_rules (*)
            `)
            .eq('id', flagId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Feature flag not found.' });
        }

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch flag details.' });
    }
};


/**
 * Permanently deletes a feature flag and all its associated targeting rules and audit logs.
 * @async
 * @function deleteFlag
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const deleteFlag = async (req, res) => {
    try {
        const { flagId } = req.params;

        // 1. Fetch the flag to get project_id for cache invalidation
        const { data: flag, error: fetchError } = await supabase
            .from('feature_flags')
            .select('project_id, name')
            .eq('id', flagId)
            .single();

        if (fetchError || !flag) {
            return res.status(404).json({ error: 'Feature flag not found.' });
        }

        // 2. Delete the flag (targeting_rules and audit_logs cascade via DB foreign keys)
        const { error: deleteError } = await supabase
            .from('feature_flags')
            .delete()
            .eq('id', flagId);

        if (deleteError) throw deleteError;

        // 3. Invalidate Redis cache and invalidate the API key cache for the project
        await pushRulesetUpdate(flag.project_id);

        res.status(200).json({ message: `Flag "${flag.name}" deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete flag.' });
    }
};

/**
 * Retrieves the audit log history for a specific feature flag.
 * @async
 * @function getFlagAuditLogs
 */
export const getFlagAuditLogs = async (req, res) => {
    try {
        const { flagId } = req.params;

        const { data, error } = await supabase
            .from('audit_logs')
            // FIX: Removed the broken join to the auth schema
            .select('*') 
            .eq('flag_id', flagId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch audit logs.' });
    }
};