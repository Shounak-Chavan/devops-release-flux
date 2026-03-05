import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

// 1. MOCK EVERYTHING BEFORE IMPORTING APP
jest.unstable_mockModule('../services/redisClient.js', () => ({
  default: {
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(null),
    quit: jest.fn().mockResolvedValue(null),
  }
}));

// Mock Prisma
jest.unstable_mockModule('@prisma/client', () => {
  const mPrisma = {
    environment: { findUnique: jest.fn() },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// 2. NOW IMPORT APP AND MOCKS
const app = (await import('../index.js')).default;
const redisClient = (await import('../services/redisClient.js')).default;
const { PrismaClient } = await import('@prisma/client');
const prisma = new PrismaClient();

describe('Evaluation API (POST /api/v1/evaluate)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if API key is missing', async () => {
    // The reason you got 400 was likely Zod validation. 
    // If the body is empty or invalid, Zod hits it first.
    const response = await request(app)
      .post('/api/v1/evaluate')
      .send({ userId: '123' }); // No Auth Header

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing or invalid API key format');
  });

  it('should return cached flags directly from Redis (Cache Hit)', async () => {
    const mockConfig = { 'dark-mode': { isEnabled: true, rolloutPercentage: 100 } };
    redisClient.get.mockResolvedValue(JSON.stringify(mockConfig));

    const response = await request(app)
      .post('/api/v1/evaluate')
      .set('Authorization', 'Bearer ff_test_key')
      .send({ userId: '123' });

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('cache');
    expect(response.body.flags['dark-mode']).toBe(true);
  });
});