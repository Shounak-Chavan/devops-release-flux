import { z } from 'zod';

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Body validation failed', details: error.errors });
    }
    next(error);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Query validation failed', details: error.errors });
    }
    next(error);
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Params validation failed', details: error.errors });
    }
    next(error);
  }
};

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Project Schemas
export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters long').max(50),
});

// Flag Schemas
export const flagSchema = z.object({
  key: z.string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Key must be lowercase, alphanumeric, and can only contain dashes (e.g., new-checkout-ui)'),
  name: z.string().min(3, 'Flag name must be at least 3 characters long'),
  description: z.string().optional(),
  projectId: z.string().uuid('Invalid Project ID format'),
});


export const getFlagsQuerySchema = z.object({
  projectId: z.string().uuid('Invalid Project ID format'),
});

export const flagIdParamSchema = z.object({
  flagId: z.string().uuid('Invalid Flag ID format'),
});

export const toggleFlagSchema = z.object({
  isEnabled: z.boolean({
    required_error: "isEnabled is required",
    invalid_type_error: "isEnabled must be a boolean",
  }),
});