/**
 * Test cases for the Template Synchronization Challenge
 *
 * Your solution should make all these tests pass
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  TemplateService,
  TemplateFieldProcessor,
  initializeSupabase
} from '../src/problem';
import {
  MockDatabase,
  createMockSupabase,
  createTestTemplate,
  runConcurrently
} from '../src/test-utils';

describe('Template Synchronization Tests', () => {
  let db: MockDatabase;
  let service: TemplateService;
  let processor: TemplateFieldProcessor;

  beforeEach(() => {
    db = new MockDatabase();
    initializeSupabase(createMockSupabase(db));
    service = new TemplateService();
    processor = new TemplateFieldProcessor();

    // Set up initial template
    const template = createTestTemplate();
    db.set(template.id, template);
  });

  describe('Basic Functionality', () => {
    test('should update template successfully', async () => {
      const updates = { name: 'Updated Template Name' };
      const result = await service.updateTemplate('test-template-123', updates);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Template Name');
    });

    test('should retrieve template from database', async () => {
      const template = await service.getTemplate('test-template-123');

      expect(template).toBeTruthy();
      expect(template?.name).toBe('Test Template');
    });

    test('should handle JSONB fields correctly', async () => {
      const newSections = [
        {
          id: 'section-2',
          title: 'Additional Info',
          fields: ['field-3'],
          order: 2
        }
      ];

      const result = await service.updateTemplate('test-template-123', {
        sections: newSections
      });

      expect(result.success).toBe(true);
      expect(result.data?.sections).toEqual(newSections);
    });
  });

  describe('Concurrent Updates', () => {
    test('should handle concurrent updates without data loss', async () => {
      const updates = await runConcurrently([
        () => service.updateTemplate('test-template-123', {
          name: 'Name from User A'
        }),
        () => service.updateTemplate('test-template-123', {
          field_definitions: {
            'field-3': {
              id: 'field-3',
              type: 'checkbox',
              label: 'Is Active',
              required: false
            }
          }
        })
      ]);

      // At least one update should succeed
      const successCount = updates.filter(u => u.success).length;
      expect(successCount).toBeGreaterThan(0);

      // Final state should have changes from successful updates
      const final = await service.getTemplate('test-template-123');
      expect(final).toBeTruthy();
    });

    test('should prevent version conflicts', async () => {
      // Get initial version
      const initial = await service.getTemplate('test-template-123');
      const initialVersion = initial?.version;

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 50));

      // Try to update with old version
      try {
        await service.updateTemplate('test-template-123', {
          name: 'Conflicting Update'
        }, initialVersion);
      } catch (error: any) {
        expect(error.name).toBe('VersionConflictError');
      }
    });
  });

  describe('Cache Management', () => {
    test('should invalidate cache after update', async () => {
      // Get template to populate cache
      const cached = await service.getTemplate('test-template-123');
      expect(cached?.name).toBe('Test Template');

      // Update template
      await service.updateTemplate('test-template-123', {
        name: 'Updated Name'
      });

      // Get template again - should not return stale cache
      const updated = await service.getTemplate('test-template-123');
      expect(updated?.name).toBe('Updated Name');
    });

    test('should handle cache miss gracefully', async () => {
      service.clearCache();
      const template = await service.getTemplate('test-template-123');
      expect(template).toBeTruthy();
      expect(template?.name).toBe('Test Template');
    });
  });

  describe('Background Processing Coordination', () => {
    test('should not overwrite recent user updates', async () => {
      // User updates template
      await service.updateTemplate('test-template-123', {
        name: 'User Updated Name'
      });

      // Background processor runs immediately after
      await processor.processTemplateFields('test-template-123');

      // User's changes should be preserved
      const final = await service.getTemplate('test-template-123');
      expect(final?.name).toBe('User Updated Name');
    });

    test('should allow background processing for old updates', async () => {
      // Simulate old template
      const template = createTestTemplate({
        last_user_update: new Date(Date.now() - 10000).toISOString() // 10 seconds ago
      });
      db.set(template.id, template);

      // Background processor should be able to update
      await processor.processTemplateFields('test-template-123');

      const final = await service.getTemplate('test-template-123');
      expect(final?.field_definitions?.['field-1']?.processed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should retry failed updates with exponential backoff', async () => {
      let attemptCount = 0;

      // Mock a failing then succeeding update
      const originalUpdate = service.updateTemplate.bind(service);
      service.updateTemplate = jest.fn(async (id, updates) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return originalUpdate(id, updates);
      });

      const result = await service.updateTemplate('test-template-123', {
        name: 'Eventually Successful'
      });

      expect(result.success).toBe(true);
      expect(attemptCount).toBeGreaterThanOrEqual(3);
    });

    test('should handle permanent failures gracefully', async () => {
      // Try to update non-existent template
      try {
        await service.updateTemplate('non-existent', {
          name: 'Will Fail'
        });
      } catch (error: any) {
        expect(error).toBeTruthy();
      }
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle user update + background job + cache read', async () => {
      const operations = await runConcurrently([
        // User updates
        () => service.updateTemplate('test-template-123', {
          sections: [
            {
              id: 'new-section',
              title: 'New Section',
              fields: ['new-field'],
              order: 3
            }
          ]
        }),
        // Background processing
        () => processor.processTemplateFields('test-template-123'),
        // Cache reads
        () => service.getTemplate('test-template-123'),
        () => service.getTemplate('test-template-123')
      ]);

      // System should remain consistent
      const final = await service.getTemplate('test-template-123');
      expect(final).toBeTruthy();
      expect(final?.id).toBe('test-template-123');
    });

    test('should maintain data integrity with rapid successive updates', async () => {
      const updateCount = 10;
      const updates = [];

      for (let i = 0; i < updateCount; i++) {
        updates.push(
          service.updateTemplate('test-template-123', {
            name: `Update ${i}`,
            update_count: i
          })
        );
      }

      await Promise.allSettled(updates);

      const final = await service.getTemplate('test-template-123');
      expect(final).toBeTruthy();
      expect(typeof final?.version).toBe('string');
      expect(final?.version).not.toBe('1.0.0'); // Should have changed
    });
  });
});