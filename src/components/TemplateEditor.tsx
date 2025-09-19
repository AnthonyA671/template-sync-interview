import React, { useState } from 'react';
import { Template, TemplateUpdate, UpdateResult, TemplateSection, FieldDefinition } from '../types';

interface TemplateEditorProps {
  template: Template;
  onUpdate: (templateId: string, updates: Partial<TemplateUpdate>) => Promise<UpdateResult>;
  onBack: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onUpdate, onBack }) => {
  const [editedTemplate, setEditedTemplate] = useState<Template>({ ...template });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTemplate({ ...editedTemplate, name: e.target.value });
  };

  const handleSectionChange = (index: number, field: keyof TemplateSection, value: any) => {
    const newSections = [...editedTemplate.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setEditedTemplate({ ...editedTemplate, sections: newSections });
  };

  const handleAddSection = () => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      fields: [],
      order: editedTemplate.sections.length
    };
    setEditedTemplate({
      ...editedTemplate,
      sections: [...editedTemplate.sections, newSection]
    });
  };

  const handleRemoveSection = (index: number) => {
    const newSections = editedTemplate.sections.filter((_, i) => i !== index);
    setEditedTemplate({ ...editedTemplate, sections: newSections });
  };

  const handleFieldDefinitionChange = (fieldId: string, field: keyof FieldDefinition, value: any) => {
    const newFieldDefinitions = {
      ...editedTemplate.field_definitions,
      [fieldId]: {
        ...editedTemplate.field_definitions[fieldId],
        [field]: value
      }
    };
    setEditedTemplate({ ...editedTemplate, field_definitions: newFieldDefinitions });
  };

  const handleSave = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);

    const updates: Partial<TemplateUpdate> = {
      name: editedTemplate.name,
      sections: editedTemplate.sections,
      field_definitions: editedTemplate.field_definitions,
      version: editedTemplate.version
    };

    try {
      const result = await onUpdate(template.id, updates);
      if (result.success) {
        setUpdateMessage('Template updated successfully!');
        if (result.newVersion) {
          setEditedTemplate({ ...editedTemplate, version: result.newVersion });
        }
      } else {
        setUpdateMessage(`Update failed: ${result.error?.message}`);
      }
    } catch (error) {
      setUpdateMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="template-editor">
      <div className="editor-header">
        <button onClick={onBack}>← Back to Templates</button>
        <h2>Edit Template</h2>
      </div>

      {updateMessage && (
        <div className={`message ${updateMessage.includes('failed') || updateMessage.includes('Error') ? 'error' : 'success'}`}>
          {updateMessage}
        </div>
      )}

      <div className="editor-content">
        <div className="field-group">
          <label htmlFor="template-name">Template Name:</label>
          <input
            id="template-name"
            type="text"
            value={editedTemplate.name}
            onChange={handleNameChange}
            disabled={isUpdating}
          />
        </div>

        <div className="field-group">
          <label>Version: {editedTemplate.version}</label>
        </div>

        <div className="sections-editor">
          <h3>Sections</h3>
          {editedTemplate.sections.map((section, index) => (
            <div key={section.id} className="section-item">
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                disabled={isUpdating}
              />
              <input
                type="number"
                value={section.order}
                onChange={(e) => handleSectionChange(index, 'order', parseInt(e.target.value))}
                disabled={isUpdating}
              />
              <button onClick={() => handleRemoveSection(index)} disabled={isUpdating}>
                Remove
              </button>
            </div>
          ))}
          <button onClick={handleAddSection} disabled={isUpdating}>
            Add Section
          </button>
        </div>

        <div className="fields-editor">
          <h3>Field Definitions</h3>
          {Object.entries(editedTemplate.field_definitions).map(([fieldId, field]) => (
            <div key={fieldId} className="field-item">
              <h4>{fieldId}</h4>
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleFieldDefinitionChange(fieldId, 'label', e.target.value)}
                placeholder="Label"
                disabled={isUpdating}
              />
              <select
                value={field.type}
                onChange={(e) => handleFieldDefinitionChange(fieldId, 'type', e.target.value as FieldDefinition['type'])}
                disabled={isUpdating}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select</option>
                <option value="date">Date</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => handleFieldDefinitionChange(fieldId, 'required', e.target.checked)}
                  disabled={isUpdating}
                />
                Required
              </label>
            </div>
          ))}
        </div>

        <div className="editor-actions">
          <button onClick={handleSave} disabled={isUpdating} className="primary">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};