import { queue } from '../config/queue.js';
import { supabase } from '../config/supabase.js';
import { redis } from '../config/redis.js';
import { sendEmailNotification } from '../shared/utils/mailer.js';
import { getEnvironmentRuleset } from '../modules/sdk/sdk.controller.js'; // Import our new robust fetcher

export const registerFlagWorker = async () => {
    await queue.work('toggle-flag', async (job) => {
        const { flagId, targetStatus, userId , userEmail } = job.data;

        try {
            const { data: flag, error: fetchError } = await supabase
                .from('feature_flags')
                .select('project_id, status')
                .eq('id', flagId)
                .single();

            if (fetchError || !flag) throw new Error('Flag not found.');

            if (flag.status !== targetStatus) {
                // Update flag
                await supabase
                    .from('feature_flags')
                    .update({ status: targetStatus, updated_at: new Date().toISOString() })
                    .eq('id', flagId);

                // Write Audit Log
                await supabase.from('audit_logs').insert([{
                    flag_id: flagId,
                    user_id: userId,
                    action: targetStatus ? 'SCHEDULED_ON' : 'SCHEDULED_OFF',
                    previous_state: { status: flag.status },
                    new_state: { status: targetStatus }
                }]);

                // 🔥 NEW: Stale-While-Revalidate & Pub/Sub
                const freshRuleset = await getEnvironmentRuleset(flag.project_id);
                const cacheKey = `project_flags_rules:${flag.project_id}`;
                
                await redis.set(cacheKey, JSON.stringify(freshRuleset), 'EX', 3600);
                await broadcastToProject(flag.project_id, {
                    type: 'RULESET_UPDATED',
                    data: freshRuleset,
                    timestamp: Date.now()
                });

                await sendEmailNotification(
                    userEmail,
                    `Scheduled Flag Executed`,
                    `<p>Your scheduled job has finished. A flag was automatically toggled to <strong>${targetStatus ? 'ON' : 'OFF'}</strong>.</p>`
                );
            }
        } catch (error) {
            console.error(`Scheduled job failed for flag ${flagId}:`, error.message);
            throw error; 
        }
    });
};