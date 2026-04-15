import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '../config/env.js';

import projectRoutes from '../modules/projects/projects.routes.js';
import flagRoutes from '../modules/flags/flags.routes.js';
import sdkRoutes from '../modules/sdk/sdk.routes.js';
import usageRoutes from '../modules/usage/usage.routes.js';

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
    app.use(cors({
    origin: '*', // Allows any frontend to connect (crucial for an SDK backend)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
    app.use(express.json()); 

    // Health Check Endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'FeatureFlow backend is healthy and running on ESM.' });
    });

    // Decoupled domain routes will be mounted here later
    app.use('/api/v1/projects', projectRoutes);
    app.use('/api/v1/flags', flagRoutes);
    app.use('/api/v1/sdk', sdkRoutes);
    app.use('/api/v1/usage', usageRoutes);

    return app;
};

export default configureApp;