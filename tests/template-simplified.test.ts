/**
 * SIMPLIFIED TEST SUITE (30-45 minute problem)
 *
 * Focus on making these 3 core test groups pass:
 * 1. Concurrent Updates (prevent data loss)
 * 2. Cache Management (no stale data)
 * 3. Retry Logic (handle conflicts)
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { TemplateService, initializeSupabase } from '../src/problem-simplified';
import { MockDatabase, createMockSupabase, createTestTemplate } from '../src/test-utils';

describe('Template Sync Tests - 30 Minutes', () => {
  let db: MockDatabase;
  let service: TemplateService;

  beforeEach(() => {
    db = new MockDatabase();
    initializeSupabase(createMockSupabase(db));
    service = new TemplateService();

    // Set up initial template
    const template = createTestTemplate({
      id: 'template-1',
      name: 'Original Name',
      description: 'Original Description',
      version: '1'
    });
    db.set(template.id, template);
  });

  /**
   * TEST GROUP 1: Concurrent Updates (15-20 min)
   * Fix the race condition where updates overwrite each other
   */
  describe('1. Concurrent Updates - Prevent Data Loss', () => {
    test('should handle two users updating different fields', async () => {
      // Two users update simultaneously
      const [resultA, resultB] = await Promise.all([
        service.updateTemplate('template-1', { name: 'Updated by User A' }),
        service.updateTemplate('template-1', { description: 'Updated by User B' })
      ]);

      // At least one should succeed
      const successCount = [resultA, resultB].filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);

      // Check final state
      const final = await service.getTemplate('template-1');
      expect(final).toBeTruthy();

      // Should have at least one of the changes
      const hasChanges =
        final?.name === 'Updated by User A' ||
        final?.description === 'Updated by User B';
      expect(hasChanges).toBe(true);
    });

    test('should detect version conflicts', async () => {
      // First update succeeds
      const result1 = await service.updateTemplate('template-1', {
        name: 'First Update'
      });
      expect(result1.success).toBe(true);

      // Manual version reset to simulate conflict
      const template = db.get('template-1');
      template.version = '1'; // Reset to old version
      db.set('template-1', template);

      // Second update should handle the conflict (retry or error)
      const result2 = await service.updateTemplate('template-1', {
        name: 'Second Update'
      });

      // Should either succeed (after retry) or fail gracefully
      // Not throw an unhandled error
      expect(result2).toBeDefined();
    });
  });

  /**
   * TEST GROUP 2: Cache Management (10-15 min)
   * Fix stale cache issues
   */
  describe('2. Cache Management - No Stale Data', () => {
    test('should return fresh data after update', async () => {
      // Get initial data (caches it)
      const initial = await service.getTemplate('template-1');
      expect(initial?.name).toBe('Original Name');

      // Update the template
      await service.updateTemplate('template-1', {
        name: 'New Name After Update'
      });

      // Get again - should NOT return cached old name
      const updated = await service.getTemplate('template-1');
      expect(updated?.name).toBe('New Name After Update');
    });

    test('should invalidate cache for updated template', async () => {
      // Pre-populate cache
      await service.getTemplate('template-1');

      // Update
      await service.updateTemplate('template-1', {
        description: 'Cache should be cleared'
      });

      // This should hit the database, not cache
      const fresh = await service.getTemplate('template-1');
      expect(fresh?.description).toBe('Cache should be cleared');
    });
  });

  /**
   * TEST GROUP 3: Basic Retry Logic (10-15 min)
   * Add retry capability for failed updates
   */
  describe('3. Retry Logic - Handle Conflicts Gracefully', () => {
    test('should retry on conflict', async () => {
      let attemptCount = 0;

      // Mock a conflict that succeeds on retry
      const originalUpdate = service.updateTemplate.bind(service);
      service.updateTemplate = jest.fn(async (id, updates) => {
        attemptCount++;
        if (attemptCount === 1) {
          // First attempt fails
          throw new Error('Version conflict');
        }
        // Second attempt succeeds
        return originalUpdate(id, updates);
      });

      // Should succeed after retry
      const result = await service.updateTemplate('template-1', {
        name: 'Success after retry'
      });

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2); // Tried twice
    });

    test('should not retry forever', async () => {
      // Mock permanent failure
      service.updateTemplate = jest.fn(async () => {
        throw new Error('Permanent failure');
      });

      // Should eventually give up
      let error;
      try {
        await service.updateTemplate('template-1', { name: 'Will fail' });
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();

      // Should have tried 2-3 times max, not infinite
      expect(service.updateTemplate).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * BONUS TEST (If time permits)
   * Combine all fixes in one scenario
   */
  describe('Bonus: Integration Test', () => {
    test('should handle update, cache, and retry together', async () => {
      // Parallel updates
      const updates = await Promise.allSettled([
        service.updateTemplate('template-1', { name: 'Update 1' }),
        service.updateTemplate('template-1', { name: 'Update 2' }),
        service.updateTemplate('template-1', { name: 'Update 3' })
      ]);

      // Some should succeed
      const succeeded = updates.filter(u => u.status === 'fulfilled').length;
      expect(succeeded).toBeGreaterThan(0);

      // Cache should be fresh
      const final = await service.getTemplate('template-1');
      expect(final?.name).toMatch(/Update [123]/);
    });
  });
});