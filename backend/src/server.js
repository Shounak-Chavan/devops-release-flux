import configureApp from './api/app.js';
import { config } from './config/env.js';

const app = configureApp();

/**
 * Starts the Express server.
 * * @function startServer
 * @returns {void}
 */
const startServer = () => {
    app.listen(config.PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${config.PORT} in ${config.NODE_ENV} mode.`);
    });
};

startServer();