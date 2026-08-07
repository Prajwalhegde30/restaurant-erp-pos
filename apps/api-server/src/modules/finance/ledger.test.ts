import { expect, test, describe } from 'vitest';
import { ledgerRouter } from './ledger.router';

describe('Finance Ledger', () => {
  test('should expose ledger endpoints', () => {
    expect(ledgerRouter).toBeDefined();
  });
});
