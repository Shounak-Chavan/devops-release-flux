import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Generates a secure, random API key for a specific environment.
 * @param {string} envName - The name of the environment (e.g., 'Development', 'Production').
 * @returns {string} The prefixed API key.
 */
const generateApiKey = (envName) => {
  const randomString = crypto.randomBytes(16).toString('hex');
  const prefix = envName === 'Production' ? 'ff_live_' : 'ff_test_';
  return `${prefix}${randomString}`;
};

/**
 * Creates a new project and automatically provisions default environments (Development, Production)
 * along with their unique API keys.
 * * @async
 * @function createProject
 * @param {import('express').Request} req - Express request object containing the project name.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} 201 status with the provisioned project and environments.
 */
export const createProject = async (req, res) => {
  const { name } = req.body;
  
  // Safely extract userId. requireAuth middleware guarantees this exists, but defensive checks are best practice.
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User context missing' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        userId,
        environments: {
          create: [
            { name: 'Development', apiKey: generateApiKey('Development') },
            { name: 'Production', apiKey: generateApiKey('Production') }
          ]
        }
      },
      include: {
        environments: true 
      }
    });

    res.status(201).json({ 
      message: 'Project provisioned successfully', 
      project 
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

/**
 * Retrieves all projects and their associated environments for the authenticated user.
 * * @async
 * @function getProjects
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const getProjects = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        environments: {
          select: { id: true, name: true, apiKey: true } // Exclude unnecessary data
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};