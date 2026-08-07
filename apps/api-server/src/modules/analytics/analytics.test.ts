import { expect, test, describe } from 'vitest';
import { analyticsRouter } from './analytics.router';

describe('Analytics API', () => {
  test('should expose analytics endpoints', () => {
    expect(analyticsRouter).toBeDefined();
  });
});
