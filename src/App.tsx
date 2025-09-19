import React from 'react';
import { TemplateManager } from './components/TemplateManager';
import { TemplateProvider } from './contexts/TemplateContext';

const App: React.FC = () => {
  return (
    <TemplateProvider>
      <div className="app">
        <header className="app-header">
          <h1>Template Synchronization System</h1>
        </header>
        <main className="app-main">
          <TemplateManager />
        </main>
      </div>
    </TemplateProvider>
  );
};

export default App;