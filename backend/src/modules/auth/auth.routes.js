import { Router } from 'express';
import { signUpUser, logInUser } from './auth.controller.js';

const router = Router();

/**
 * @route POST /api/v1/auth/signup
 * @description Register a new user
 */
router.post('/signup', signUpUser);

/**
 * @route POST /api/v1/auth/login
 * @description Authenticate an existing user and get a token
 */
router.post('/login', logInUser);

export default router;