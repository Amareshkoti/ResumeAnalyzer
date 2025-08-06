import React, { useState } from 'react';
import { TimetableConfig } from '../types/timetable';
import { exportConfigToJSON, importConfigFromJSON, getDefaultConfig } from '../utils/configManager';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface JSONConfigFormProps {
  onConfigLoad: (config: TimetableConfig) => void;
  currentConfig?: TimetableConfig;
}

export const JSONConfigForm: React.FC<JSONConfigFormProps> = ({
  onConfigLoad,
  currentConfig
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = importConfigFromJSON(content);
        onConfigLoad(config);
        setSuccess('Configuration loaded successfully!');
        setJsonInput(content);
      } catch (err) {
        setError(`Failed to load configuration: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleLoadFromInput = () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON configuration');
      return;
    }

    try {
      const config = importConfigFromJSON(jsonInput);
      onConfigLoad(config);
      setSuccess('Configuration loaded successfully!');
    } catch (err) {
      setError(`Invalid JSON configuration: ${err}`);
    }
  };

  const handleExportConfig = () => {
    const configToExport = currentConfig || getDefaultConfig();
    const jsonString = exportConfigToJSON(configToExport);
    
    // Create and download file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess('Configuration exported successfully!');
  };

  const handleLoadDefault = () => {
    const defaultConfig = getDefaultConfig();
    onConfigLoad(defaultConfig);
    setJsonInput(exportConfigToJSON(defaultConfig));
    setSuccess('Default configuration loaded!');
  };

  const handleCopyToClipboard = () => {
    const configToCopy = currentConfig || getDefaultConfig();
    const jsonString = exportConfigToJSON(configToCopy);
    navigator.clipboard.writeText(jsonString);
    setSuccess('Configuration copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">JSON Configuration</h2>
          <p className="text-gray-600">Import or export timetable configurations</p>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload JSON Configuration File
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
            <Upload className="w-4 h-4" />
            Choose File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {isLoading && <span className="text-gray-500">Loading...</span>}
        </div>
      </div>

      {/* JSON Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or paste JSON configuration directly
        </label>
        <textarea
          value={jsonInput}
          onChange={handleJsonInputChange}
          placeholder="Paste your JSON configuration here..."
          className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleLoadFromInput}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Load Configuration
          </button>
          <button
            onClick={handleLoadDefault}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Load Default
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Export Configuration
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleExportConfig}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <FileText className="w-4 h-4" />
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Configuration Schema Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Configuration Schema</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>settings:</strong> General timetable settings (sections, hours, duration)</p>
          <p><strong>faculty:</strong> List of faculty members with subjects and constraints</p>
          <p><strong>constraints:</strong> Break times, weekly test, and rotating activities</p>
          <p><strong>Lab faculty:</strong> Mark with <code>"type": "Lab"</code> for lab sessions</p>
        </div>
      </div>
    </div>
  );
}; 