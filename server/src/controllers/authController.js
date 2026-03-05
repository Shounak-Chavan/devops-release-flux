import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key';

/**
 * Registers a new user (tenant) in the SaaS platform.
 * Validates the input, ensures the email is unique, hashes the password,
 * and provisions an initial JSON Web Token for immediate authentication.
 * * @async
 * @function register
 * @param {import('express').Request} req - Express request object containing email, password, and name in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a 201 status with the JWT and user profile on success.
 */
export const register = async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Insufficient data provided. Name, email, and password are required." });
  }
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    
    // As per your system design, production environments should ideally send this token via HTTP-only cookies[cite: 135].
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Authenticates an existing user and issues a new JWT.
 * Verifies the user exists and securely compares the provided password
 * against the stored bcrypt hash.
 * * @async
 * @function login
 * @param {import('express').Request} req - Express request object containing email and password in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a 200 status with the JWT and user profile on success.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 1. Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use generic error messages for auth to prevent email enumeration
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Issue a new token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};