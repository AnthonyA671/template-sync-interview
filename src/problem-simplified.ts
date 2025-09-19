/**
 * SIMPLIFIED TEMPLATE SYNCHRONIZATION PROBLEM (30-45 minutes)
 *
 * Current Issues to Fix:
 * 1. Concurrent updates lose data (one overwrites the other)
 * 2. Cache returns stale data after updates
 * 3. No retry on conflicts (fails immediately)
 *
 * YOUR TASK: Fix these 3 issues in the methods below
 */

import { Template, TemplateUpdate, SupabaseClient } from './types';

export let supabase: SupabaseClient;

export function initializeSupabase(client: SupabaseClient) {
  supabase = client;
}

/**
 * SIMPLIFIED TEMPLATE SERVICE
 * Focus on fixing the 3 core issues in 30-45 minutes
 */
export class TemplateService {
  private cache = new Map<string, any>();

  /**
   * PROBLEM #1: This method loses data during concurrent updates
   * PROBLEM #3: No retry logic when conflicts occur
   *
   * TODO: Add version checking and basic retry
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateUpdate>
  ): Promise<{ success: boolean; data?: any }> {
    try {
      // ISSUE: Direct update without checking if someone else updated first
      const { data, error } = await supabase
        .from('template_library')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      // ISSUE: Cache not invalidated - will return stale data
      // this.cache.set(templateId, data); // WRONG!

      return { success: true, data };

    } catch (error) {
      console.error('Update failed:', error);
      // ISSUE: Fails immediately, no retry
      throw error;
    }
  }

  /**
   * PROBLEM #2: Returns stale cached data after updates
   *
   * TODO: Fix cache invalidation
   */
  async getTemplate(templateId: string): Promise<Template | null> {
    // ISSUE: Returns potentially stale cached data
    if (this.cache.has(templateId)) {
      console.log('Returning cached data for', templateId);
      return this.cache.get(templateId);
    }

    const { data, error } = await supabase
      .from('template_library')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      console.error('Failed to fetch template:', error);
      return null;
    }

    // Cache the result
    this.cache.set(templateId, data);
    return data;
  }

  /**
   * Helper method to clear cache (not currently used)
   */
  clearCache(templateId?: string): void {
    if (templateId) {
      this.cache.delete(templateId);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * HINTS FOR QUICK IMPLEMENTATION:
 *
 * 1. Version Checking:
 *    - Get current version before updating
 *    - Include version in update WHERE clause
 *    - If no rows updated = version conflict
 *
 * 2. Cache Fix:
 *    - Clear cache after successful update
 *    - Or add timestamp to cache entries
 *
 * 3. Simple Retry:
 *    - Wrap update logic in retry loop
 *    - Max 2-3 attempts
 *    - Small delay between retries (100ms)
 *
 * Example helper you might add:
 * private async sleep(ms: number) {
 *   return new Promise(resolve => setTimeout(resolve, ms));
 * }
 */