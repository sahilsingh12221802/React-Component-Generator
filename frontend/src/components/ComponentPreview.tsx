'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, Code, FileText, Copy, Download, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Session } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import useStore from '@/store/useStore';
import toast from 'react-hot-toast';

interface ComponentPreviewProps {
  session: Session;
}

type TabType = 'preview' | 'jsx' | 'css';

const ComponentPreview: React.FC<ComponentPreviewProps> = ({ session }) => {
  const { currentComponent, updateComponent } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const component = currentComponent || session.currentComponent;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        setSelectedElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleElementClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    if (target !== previewRef.current) {
      setSelectedElement(target);
    }
  };

  const handleCopyCode = async (type: 'jsx' | 'css' | 'full') => {
    if (!component) return;

    try {
      let code = '';
      if (type === 'jsx') {
        code = component.jsx || '';
      } else if (type === 'css') {
        code = component.css || '';
      } else {
        code = `// JSX Component\n${component.jsx || ''}\n\n// CSS Styles\n${component.css || ''}`;
      }

      await copyToClipboard(code);
      toast.success(`${type.toUpperCase()} code copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownloadCode = async (type: 'jsx' | 'css' | 'full') => {
    if (!component) return;

    try {
      let code = '';
      let filename = '';
      
      if (type === 'jsx') {
        code = component.jsx || '';
        filename = `${session.title}-component.jsx`;
      } else if (type === 'css') {
        code = component.css || '';
        filename = `${session.title}-styles.css`;
      } else {
        code = `// JSX Component\n${component.jsx || ''}\n\n// CSS Styles\n${component.css || ''}`;
        filename = `${session.title}-component.jsx`;
      }

      downloadFile(filename, code);
      toast.success(`${type.toUpperCase()} code downloaded successfully!`);
    } catch (error) {
      toast.error('Failed to download code');
    }
  };

  const handleExportZip = async () => {
    if (!component) return;

    try {
      // This would typically call the backend export endpoint
      // For now, we'll create a simple ZIP with the files
      const jsxCode = component.jsx || '';
      const cssCode = component.css || '';
      
      // Create a combined file for now
      const fullCode = `// JSX Component\n${jsxCode}\n\n// CSS Styles\n${cssCode}`;
      downloadFile(`${session.title}-component.zip`, fullCode);
      toast.success('Component exported successfully!');
    } catch (error) {
      toast.error('Failed to export component');
    }
  };

  const renderPreview = () => {
    if (!component?.jsx) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No component to preview</p>
            <p className="text-sm">Generate a component in the chat to see it here</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          ref={previewRef}
          className="min-h-64 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          onClick={handleElementClick}
          style={{ cursor: 'pointer' }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <style>${component.css || ''}</style>
                ${component.jsx || ''}
              `
            }}
          />
        </div>

        {selectedElement && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-xs">
            {selectedElement.tagName.toLowerCase()}
          </div>
        )}
      </div>
    );
  };

  const renderCodeTab = (type: 'jsx' | 'css') => {
    const code = type === 'jsx' ? component?.jsx : component?.css;
    
    if (!code) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No {type.toUpperCase()} code available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyCode(type)}
            className="h-6 px-2 text-xs"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadCode(type)}
            className="h-6 px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono min-h-64">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const tabs = [
    { id: 'preview' as TabType, label: 'Preview', icon: Eye },
    { id: 'jsx' as TabType, label: 'JSX', icon: Code },
    { id: 'css' as TabType, label: 'CSS', icon: FileText },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Component Preview</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCode('full')}
              className="h-8 px-2 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportZip}
              className="h-8 px-2 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
                  ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="p-4">
          {activeTab === 'preview' && renderPreview()}
          {activeTab === 'jsx' && renderCodeTab('jsx')}
          {activeTab === 'css' && renderCodeTab('css')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComponentPreview; 