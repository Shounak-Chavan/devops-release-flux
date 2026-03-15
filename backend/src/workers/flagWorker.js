import { queue } from '../config/queue.js';
import { supabase } from '../config/supabase.js';
import { redis } from '../config/redis.js';
import { broadcastFlagUpdate } from '../shared/utils/realtime.js';
import { sendEmailNotification } from '../shared/utils/mailer.js';

/**
 * Registers the background worker to listen for scheduled flag toggles.
 * When the scheduled time arrives, pg-boss will execute this function.
 * @async
 * @function registerFlagWorker
 */
export const registerFlagWorker = async () => {
    await queue.work('toggle-flag', async (job) => {
        const { flagId, targetStatus, userId , userEmail } = job.data;
        
        console.log(` Processing scheduled toggle for flag ${flagId}...`);

        try {
            // 1. Fetch current flag state and project ID
            const { data: flag, error: fetchError } = await supabase
                .from('feature_flags')
                .select('project_id, status')
                .eq('id', flagId)
                .single();

            if (fetchError || !flag) throw new Error('Flag not found.');

            // Only update if the status is actually different
            if (flag.status !== targetStatus) {
                // 2. Update the flag status
                await supabase
                    .from('feature_flags')
                    .update({ status: targetStatus, updated_at: new Date().toISOString() })
                    .eq('id', flagId);

                // 3. Write to Audit Log marking it as a SCHEDULED action
                await supabase.from('audit_logs').insert([{
                    flag_id: flagId,
                    user_id: userId,
                    action: targetStatus ? 'SCHEDULED_ON' : 'SCHEDULED_OFF',
                    previous_state: { status: flag.status },
                    new_state: { status: targetStatus }
                }]);

                // 4. Invalidate Cache and Broadcast
                const cacheKey = `project_flags_rules:${flag.project_id}`;
                await redis.del(cacheKey);
                await broadcastFlagUpdate(flag.project_id);
                
                console.log(` Scheduled toggle complete for flag ${flagId}.`);

                // After cache invalidation and broadcast:
                await sendEmailNotification(
                    userEmail, // <-- Use the email we passed through the queue
                    `Scheduled Flag Executed`,
                    `<p>Your scheduled job has finished. A flag was automatically toggled to <strong>${targetStatus ? 'ON' : 'OFF'}</strong>.</p>`
                );
                
                console.log(` Scheduled toggle complete for flag ${flagId}.`);
            }
        } catch (error) {
            console.error(` Scheduled job failed for flag ${flagId}:`, error.message);
            throw error; // Let pg-boss know the job failed so it can retry
        }
    });
};