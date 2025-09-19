/**
 * SIMPLIFIED SOLUTION (30-45 minute implementation)
 *
 * This solution focuses on 3 core fixes:
 * 1. Version checking to prevent data loss
 * 2. Cache invalidation after updates
 * 3. Simple retry logic with 2 attempts
 *
 * FOR INTERVIEWERS ONLY
 */

import { Template, TemplateUpdate, SupabaseClient } from './src/types';

export let supabase: SupabaseClient;

export function initializeSupabase(client: SupabaseClient) {
  supabase = client;
}

/**
 * SIMPLIFIED WORKING SOLUTION
 * A candidate should be able to implement something similar in 30-45 minutes
 */
export class TemplateService {
  private cache = new Map<string, any>();
  private readonly MAX_RETRIES = 2;

  /**
   * FIX #1 & #3: Add version checking and retry logic
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateUpdate>
  ): Promise<{ success: boolean; data?: any }> {
    let attempts = 0;

    while (attempts < this.MAX_RETRIES) {
      attempts++;

      try {
        // Step 1: Get current template with version
        const { data: current, error: fetchError } = await supabase
          .from('template_library')
          .select('*')
          .eq('id', templateId)
          .single();

        if (fetchError) throw fetchError;

        // Step 2: Update with version check (optimistic locking)
        const newVersion = String(Number(current.version || '0') + 1);

        const { data: updated, error: updateError } = await supabase
          .from('template_library')
          .update({
            ...updates,
            version: newVersion,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('version', current.version) // Version check!
          .select()
          .single();

        if (updateError) {
          // Version conflict - someone else updated
          if (updateError.code === 'PGRST116' && attempts < this.MAX_RETRIES) {
            // Wait a bit and retry
            await this.sleep(100 * attempts); // Exponential backoff
            continue;
          }
          throw updateError;
        }

        // FIX #2: Clear cache after successful update
        this.cache.delete(templateId);

        return { success: true, data: updated };

      } catch (error) {
        // Last attempt failed
        if (attempts >= this.MAX_RETRIES) {
          console.error(`Update failed after ${attempts} attempts:`, error);
          return { success: false, data: null };
        }
      }
    }

    return { success: false, data: null };
  }

  /**
   * FIX #2: Cache is properly managed now
   */
  async getTemplate(templateId: string): Promise<Template | null> {
    // Check cache first
    if (this.cache.has(templateId)) {
      console.log('Returning cached data for', templateId);
      return this.cache.get(templateId);
    }

    // Fetch from database
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
   * Clear cache utility
   */
  clearCache(templateId?: string): void {
    if (templateId) {
      this.cache.delete(templateId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Simple sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * ALTERNATIVE SIMPLER SOLUTION (Even more basic)
 *
 * If candidate struggles with version checking, this is acceptable:
 */
export class BasicTemplateService {
  private cache = new Map<string, any>();

  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateUpdate>
  ): Promise<{ success: boolean; data?: any }> {
    // Simple retry wrapper
    for (let i = 0; i < 2; i++) {
      try {
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

        // Always clear cache after update
        this.cache.delete(templateId);

        return { success: true, data };

      } catch (error) {
        if (i === 0) {
          // Wait and retry once
          await new Promise(r => setTimeout(r, 100));
          continue;
        }
        console.error('Update failed:', error);
        return { success: false };
      }
    }

    return { success: false };
  }

  async getTemplate(templateId: string): Promise<Template | null> {
    // Simple cache with timeout
    const cached = this.cache.get(templateId);
    if (cached && cached.timestamp > Date.now() - 30000) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('template_library')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) return null;

    // Cache with timestamp
    this.cache.set(templateId, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}

/**
 * EVALUATION NOTES FOR INTERVIEWERS:
 *
 * Excellent (9-10/10):
 * - Implements proper version checking
 * - Cache invalidation works correctly
 * - Retry with exponential backoff
 * - Clean, readable code
 *
 * Good (7-8/10):
 * - Basic version checking OR retry logic
 * - Cache cleared after updates
 * - Most tests pass
 *
 * Acceptable (5-6/10):
 * - Attempts to fix concurrency
 * - Some cache management
 * - At least tries retry logic
 *
 * Time Guidelines:
 * - 5 min: Understand problem
 * - 10 min: Implement version checking
 * - 10 min: Fix cache invalidation
 * - 10 min: Add retry logic
 * - 10 min: Test and refine
 *
 * Common Mistakes to Watch For:
 * - Forgetting to clear cache
 * - Infinite retry loops
 * - Not checking version properly
 * - Over-complicating the solution
 */