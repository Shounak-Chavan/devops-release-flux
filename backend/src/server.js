import configureApp from './api/app.js';
import { config } from './config/env.js';
import { startQueue } from './config/queue.js';
import { testRedisConnection } from './config/redis.js';
import { registerFlagWorker } from './workers/flagWorker.js';
import { processUsageBuffer } from './workers/usageWorker.js';

const app = configureApp();

/**
 * Starts the Express server.
 * * @function startServer
 * @returns {void}
 */
const startServer = async () => {

    await testRedisConnection();
    await startQueue();
    await registerFlagWorker();

    setInterval(async () => {
        try {
            await processUsageBuffer();
        } catch (err) {
            console.error('Interval error processing usage:', err);
        }
    }, 60000);

    app.listen(config.PORT, () => {
        console.log(` Server is running on http://localhost:${config.PORT} in ${config.NODE_ENV} mode.`);
    });
};

startServer();