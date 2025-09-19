import React, { useState, useEffect } from 'react';
import { Template, TemplateUpdate, UpdateResult } from '../types';
import { TemplateService } from '../services/TemplateService';
import { TemplateList } from './TemplateList';
import { TemplateEditor } from './TemplateEditor';

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateService] = useState(() => new TemplateService());

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await templateService.getTemplates();
      setTemplates(result);
      setError(null);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: Partial<TemplateUpdate>) => {
    setIsLoading(true);
    try {
      const result: UpdateResult = await templateService.updateTemplate(templateId, updates);
      if (result.success) {
        await loadTemplates();
        setError(null);
        return result;
      } else {
        setError(result.error?.message || 'Update failed');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      return { success: false, error: new Error(errorMessage) };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleBackToList = () => {
    setSelectedTemplate(null);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={loadTemplates}>Retry</button>
      </div>
    );
  }

  if (selectedTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        onUpdate={handleUpdateTemplate}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <TemplateList
      templates={templates}
      onSelectTemplate={handleSelectTemplate}
    />
  );
};