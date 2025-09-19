import {
  Template,
  TemplateUpdate,
  CacheEntry,
  UpdateResult,
  SupabaseClient,
  VersionConflictError,
  UpdateFailedError
} from '../types';

export class TemplateService {
  private cache = new Map<string, CacheEntry>();
  private supabase: SupabaseClient | null = null;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    }
  }

  async getTemplates(): Promise<Template[]> {
    if (!this.supabase) {
      // Return mock data for development
      return this.getMockTemplates();
    }

    try {
      const { data, error } = await this.supabase
        .from('template_library')
        .select('*');

      if (error) throw error;
      return data as Template[];
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return this.getMockTemplates();
    }
  }

  async updateTemplate(templateId: string, updates: Partial<TemplateUpdate>): Promise<UpdateResult> {
    if (!this.supabase) {
      // Return mock result for development
      return {
        success: true,
        data: this.getMockTemplate(templateId),
        newVersion: `${Date.now()}`
      };
    }

    try {
      // Check cache for current version
      const cachedEntry = this.cache.get(templateId);
      const currentVersion = cachedEntry?.version;

      // Prepare update with version control
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        version: currentVersion ? this.incrementVersion(currentVersion) : '1.0.0'
      };

      // Attempt database update with optimistic locking
      const { data, error } = await this.supabase
        .from('template_library')
        .update(updateData)
        .eq('id', templateId)
        .eq('version', currentVersion || '')
        .single();

      if (error) {
        if (error.message?.includes('version')) {
          throw new VersionConflictError('Template version conflict detected');
        }
        throw new UpdateFailedError(error.message);
      }

      // Update cache only after successful database update
      this.cache.set(templateId, {
        data: data,
        version: updateData.version,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: data as Template,
        newVersion: updateData.version
      };
    } catch (error) {
      console.error('Template update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Update failed')
      };
    }
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private getMockTemplates(): Template[] {
    return [
      this.getMockTemplate('template-1'),
      this.getMockTemplate('template-2')
    ];
  }

  private getMockTemplate(id: string): Template {
    return {
      id,
      name: `Template ${id}`,
      sections: [
        {
          id: 'section-1',
          title: 'General Information',
          fields: ['field1', 'field2'],
          order: 0
        },
        {
          id: 'section-2',
          title: 'Details',
          fields: ['field3', 'field4'],
          order: 1
        }
      ],
      field_definitions: {
        field1: {
          id: 'field1',
          type: 'text',
          label: 'Name',
          required: true
        },
        field2: {
          id: 'field2',
          type: 'number',
          label: 'Quantity',
          required: false
        },
        field3: {
          id: 'field3',
          type: 'select',
          label: 'Category',
          required: true,
          options: ['Option A', 'Option B', 'Option C']
        },
        field4: {
          id: 'field4',
          type: 'date',
          label: 'Date',
          required: false
        }
      },
      version: '1.0.0',
      updated_at: new Date().toISOString(),
      organization_id: 'org-123',
      update_count: 0
    };
  }
}