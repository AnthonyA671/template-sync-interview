import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Template, TemplateUpdate, UpdateResult } from '../types';

interface TemplateContextType {
  templates: Template[];
  loading: boolean;
  error: string | null;
  updateTemplate: (templateId: string, updates: Partial<TemplateUpdate>) => Promise<UpdateResult>;
  refreshTemplates: () => Promise<void>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
};

interface TemplateProviderProps {
  children: ReactNode;
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // This would normally fetch from the API
      // For now, using mock data
      setTemplates([]);
    } catch (err) {
      setError('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (
    templateId: string,
    updates: Partial<TemplateUpdate>
  ): Promise<UpdateResult> => {
    try {
      // This would normally call the API
      // For now, returning a mock result
      return {
        success: true,
        data: undefined,
        newVersion: '1.0.1'
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Update failed')
      };
    }
  }, []);

  const value: TemplateContextType = {
    templates,
    loading,
    error,
    updateTemplate,
    refreshTemplates
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};