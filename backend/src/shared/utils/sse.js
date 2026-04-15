import { redisSubscriber } from '../../config/redis.js';

// Memory store for active connections: Map<ProjectId, Set<Response>>
const clients = new Map();

// Listen for messages from Redis Pub/Sub
redisSubscriber.on('message', (channel, message) => {
    const prefix = 'project_updates:';
    if (channel.startsWith(prefix)) {
        const projectId = channel.slice(prefix.length);
        
        // Find all active SSE connections for this project
        const projectClients = clients.get(projectId);
        
        if (projectClients && projectClients.size > 0) {
            // Broadcast the new ruleset to every connected client
            projectClients.forEach(res => {
                res.write(`data: ${message}\n\n`);
            });
            console.log(`[SSE] Pushed update to ${projectClients.size} clients for project ${projectId}`);
        }
    }
});

export const addClient = (projectId, res) => {
    if (!clients.has(projectId)) {
        clients.set(projectId, new Set());
        
        // Tell the Redis subscriber to start listening for this project's channel
        redisSubscriber.subscribe(`project_updates:${projectId}`, (err) => {
            if (err) console.error(`[Redis] Failed to subscribe to ${projectId}:`, err);
        });
    }
    
    clients.get(projectId).add(res);
    console.log(`[SSE] Client connected. Total for ${projectId}: ${clients.get(projectId).size}`);
};

export const removeClient = (projectId, res) => {
    const projectClients = clients.get(projectId);
    
    if (projectClients) {
        projectClients.delete(res);
        console.log(`[SSE] Client disconnected. Total for ${projectId}: ${projectClients.size}`);
        
        // Cleanup: If no one is listening to this project anymore, unsubscribe from Redis
        if (projectClients.size === 0) {
            clients.delete(projectId);
            redisSubscriber.unsubscribe(`project_updates:${projectId}`);
        }
    }
};