/**
 * Test utilities and mock implementations
 */

import { SupabaseClient, QueryBuilder } from './types';

/**
 * Mock database storage
 */
export class MockDatabase {
  private storage = new Map<string, any>();
  private locks = new Map<string, boolean>();

  set(id: string, data: any) {
    this.storage.set(id, { ...data });
  }

  get(id: string) {
    const data = this.storage.get(id);
    return data ? { ...data } : null;
  }

  update(id: string, updates: any, whereConditions?: any): boolean {
    const existing = this.get(id);
    if (!existing) return false;

    // Check version if optimistic locking is used
    if (whereConditions?.version && existing.version !== whereConditions.version) {
      return false;
    }

    this.set(id, { ...existing, ...updates });
    return true;
  }

  acquireLock(id: string): boolean {
    if (this.locks.get(id)) return false;
    this.locks.set(id, true);
    return true;
  }

  releaseLock(id: string): void {
    this.locks.delete(id);
  }

  clear() {
    this.storage.clear();
    this.locks.clear();
  }
}

/**
 * Create a mock Supabase client for testing
 */
export function createMockSupabase(db: MockDatabase): SupabaseClient {
  return {
    from(table: string): QueryBuilder {
      let query: any = { table };
      let chainedOps: any[] = [];

      const builder: QueryBuilder = {
        select(columns?: string): QueryBuilder {
          chainedOps.push({ op: 'select', columns });
          return builder;
        },

        update(values: any): QueryBuilder {
          chainedOps.push({ op: 'update', values });
          return builder;
        },

        insert(values: any): QueryBuilder {
          chainedOps.push({ op: 'insert', values });
          return builder;
        },

        eq(column: string, value: any): QueryBuilder {
          chainedOps.push({ op: 'eq', column, value });
          return builder;
        },

        single(): QueryBuilder {
          chainedOps.push({ op: 'single' });
          return builder;
        },

        then(resolve: (result: { data?: any; error?: any }) => void): void {
          // Simulate async database operation
          setTimeout(() => {
            try {
              let result: any = null;
              let error: any = null;

              // Process the chained operations
              const selectOp = chainedOps.find(op => op.op === 'select');
              const updateOp = chainedOps.find(op => op.op === 'update');
              const eqOps = chainedOps.filter(op => op.op === 'eq');

              // Get the ID from eq operations
              const idOp = eqOps.find(op => op.column === 'id');
              if (!idOp) {
                error = new Error('No ID specified');
                resolve({ error });
                return;
              }

              const id = idOp.value;

              if (updateOp) {
                // Handle update operation
                const whereConditions: any = {};
                eqOps.forEach(op => {
                  if (op.column !== 'id') {
                    whereConditions[op.column] = op.value;
                  }
                });

                const success = db.update(id, updateOp.values, whereConditions);
                if (success) {
                  result = db.get(id);
                } else {
                  error = { code: 'PGRST116', message: 'No rows updated' };
                }
              } else if (selectOp) {
                // Handle select operation
                result = db.get(id);
                if (!result) {
                  error = new Error('Not found');
                }
              }

              resolve({ data: result, error });
            } catch (err) {
              resolve({ error: err });
            }
          }, 10); // Simulate network delay
        }
      };

      return builder;
    },

    async rpc(functionName: string, params?: any): Promise<{ data?: any; error?: any }> {
      // Simulate RPC calls for locking
      if (functionName === 'acquire_template_lock') {
        const success = db.acquireLock(params.template_id);
        return { data: success, error: success ? null : new Error('Lock unavailable') };
      }

      if (functionName === 'release_template_lock') {
        db.releaseLock(params.template_id);
        return { data: true, error: null };
      }

      return { error: new Error(`Unknown RPC function: ${functionName}`) };
    }
  };
}

/**
 * Helper to create test templates
 */
export function createTestTemplate(overrides?: Partial<any>) {
  return {
    id: 'test-template-123',
    name: 'Test Template',
    sections: [
      {
        id: 'section-1',
        title: 'General Information',
        fields: ['field-1', 'field-2'],
        order: 1
      }
    ],
    field_definitions: {
      'field-1': {
        id: 'field-1',
        type: 'text',
        label: 'Equipment Name',
        required: true
      },
      'field-2': {
        id: 'field-2',
        type: 'number',
        label: 'Serial Number',
        required: false
      }
    },
    version: '1.0.0',
    updated_at: new Date().toISOString(),
    organization_id: 'org-123',
    ...overrides
  };
}

/**
 * Simulate concurrent operations
 */
export async function runConcurrently<T>(operations: (() => Promise<T>)[]): Promise<T[]> {
  return Promise.all(operations.map(op => op()));
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 1000,
  interval: number = 10
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Timeout waiting for condition');
}