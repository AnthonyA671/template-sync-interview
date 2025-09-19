import React from 'react';
import { Template } from '../types';

interface TemplateListProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ templates, onSelectTemplate }) => {
  return (
    <div className="template-list">
      <h2>Templates</h2>
      {templates.length === 0 ? (
        <p>No templates available</p>
      ) : (
        <div className="template-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onSelectTemplate(template)}
            >
              <h3>{template.name}</h3>
              <p>Version: {template.version}</p>
              <p>Sections: {template.sections?.length || 0}</p>
              <p>Last Updated: {new Date(template.updated_at).toLocaleString()}</p>
              {template.update_count && (
                <p>Updates: {template.update_count}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};