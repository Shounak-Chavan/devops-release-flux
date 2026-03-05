export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} >>`, err.message);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // Default to 500 for unhandled errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
    ? 'Internal server error' // Hide stack traces in production
    : err.message;

  res.status(statusCode).json({ error: message });
};