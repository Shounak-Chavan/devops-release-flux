import rateLimit from 'express-rate-limit';

// Stricter limit for authentication routes to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Higher throughput for the SDK evaluation endpoint
export const evaluationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Allow 1000 evaluations per minute per client
  message: { error: 'Rate limit exceeded for evaluation endpoint.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Rate limit by API Key first. If missing, use the raw socket address.
  keyGenerator: (req) => {
    return req.headers.authorization || req.socket.remoteAddress || 'unknown-client';
  },
});