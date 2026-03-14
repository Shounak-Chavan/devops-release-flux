import { supabase } from '../../config/supabase.js';

/**
 * Broadcasts an update event to a specific project's Realtime channel.
 * SDKs listening to this channel will instantly know they need to re-fetch their flags.
 * * @async
 * @function broadcastFlagUpdate
 * @param {string} projectId - The unique ID of the project whose flags were updated.
 * @returns {Promise<void>}
 */
export const broadcastFlagUpdate = async (projectId) => {
    try {
        // Create a unique channel for this specific project
        const channelName = `project_${projectId}`;
        const channel = supabase.channel(channelName);

        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // Send the broadcast payload
                await channel.send({
                    type: 'broadcast',
                    event: 'FLAG_UPDATED',
                    payload: { 
                        message: 'A flag or rule was updated.',
                        timestamp: Date.now() 
                    }
                });
                
                // Clean up the connection after sending to prevent memory leaks
                supabase.removeChannel(channel);
            }
        });
    } catch (error) {
        console.error(`Failed to broadcast update for project ${projectId}:`, error.message);
    }
};