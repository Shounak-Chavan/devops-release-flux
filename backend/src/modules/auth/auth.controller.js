import { supabase } from '../../config/supabase.js';

/**
 * Handles new user registration.
 * Connects to Supabase Auth to create a new user account.
 * * @async
 * @function signUpUser
 * @param {import('express').Request} req - The Express request object containing email and password in the body.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user data or an error message.
 */
export const signUpUser = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;

        res.status(201).json({ message: 'User created successfully', data });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Handles user login.
 * Authenticates the user with Supabase and returns a session token.
 * * @async
 * @function logInUser
 * @param {import('express').Request} req - The Express request object containing email and password.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Sends a JSON response containing the auth token/session or an error.
 */
export const logInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        res.status(200).json({ message: 'Login successful', session: data.session });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};