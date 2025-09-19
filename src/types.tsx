/**
 * Type definitions for the Template Synchronization Challenge
 */

export interface TemplateSection {
  id: string;
  title: string;
  fields: string[];
  order: number;
}

export interface FieldDefinition {
  id: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'date';
  label: string;
  required: boolean;
  validation?: any;
  options?: string[];
}

export interface InspectionVariant {
  id: string;
  name: string;
  conditions: any;
  fieldOverrides: Record<string, any>;
}

export interface TemplateUpdate {
  id: string;
  name?: string;
  sections?: TemplateSection[];
  field_definitions?: Record<string, FieldDefinition>;
  inspection_variants?: InspectionVariant[];
  version?: string;
}

export interface Template {
  id: string;
  name: string;
  sections: TemplateSection[];
  field_definitions: Record<string, FieldDefinition>;
  inspection_variants?: InspectionVariant[];
  version: string;
  updated_at: string;
  last_user_update?: string;
  organization_id: string;
  update_count?: number;
}

export interface CacheEntry {
  data: any;
  version?: string;
  timestamp?: number;
}

export interface UpdateResult {
  success: boolean;
  data?: Template;
  newVersion?: string;
  error?: Error;
}

export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionConflictError';
  }
}

export class UpdateFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpdateFailedError';
  }
}

/**
 * Mock Supabase client interface for the challenge
 */
export interface SupabaseClient {
  from(table: string): QueryBuilder;
  rpc(functionName: string, params?: any): Promise<{ data?: any; error?: any }>;
}

export interface QueryBuilder {
  select(columns?: string): QueryBuilder;
  update(values: any): QueryBuilder;
  insert(values: any): QueryBuilder;
  eq(column: string, value: any): QueryBuilder;
  single(): QueryBuilder;
  then(resolve: (result: { data?: any; error?: any }) => void): void;
}