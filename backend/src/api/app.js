import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

/**
 * Initializes and configures the Express application.
 * Sets up global middleware including CORS, security headers, and JSON parsing.
 * * @function configureApp
 * @returns {import('express').Application} The configured Express application instance.
 */
const configureApp = () => {
    const app = express();

    // Global Middleware
    app.use(helmet()); 
    app.use(cors()); 
    app.use(express.json()); 

    // Health Check Endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'FeatureFlow backend is healthy and running on ESM.' });
    });

    // Decoupled domain routes will be mounted here later
    // e.g., app.use('/api/v1/flags', flagRoutes);

    return app;
};

export default configureApp;