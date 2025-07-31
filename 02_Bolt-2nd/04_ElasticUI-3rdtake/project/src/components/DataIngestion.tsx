import React, { useState, useEffect } from 'react';
import { Upload, FileText, Database, AlertCircle, CheckCircle, X, Play } from 'lucide-react';
import { ElasticsearchService } from '../services/ElasticsearchService';

interface IngestionResult {
  success: boolean;
  message: string;
  documentsProcessed?: number;
  errors?: string[];
}

const DataIngestion: React.FC = () => {
  const [indices, setIndices] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [newIndexName, setNewIndexName] = useState('');
  const [createNewIndex, setCreateNewIndex] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'file' | 'text'>('file');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    loadIndices();
  }, []);

  const loadIndices = async () => {
    try {
      const indicesData = await ElasticsearchService.getIndices();
      const indexNames = indicesData.map((index: any) => index.index);
      setIndices(indexNames);
      if (indexNames.length > 0 && !createNewIndex) {
        setSelectedIndex(indexNames[0]);
      }
    } catch (error) {
      console.error('Error loading indices:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonData(content);
        try {
          const parsed = JSON.parse(content);
          setPreviewData(parsed);
        } catch (error) {
          setPreviewData(null);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleTextChange = (value: string) => {
    setJsonData(value);
    try {
      const parsed = JSON.parse(value);
      setPreviewData(parsed);
    } catch (error) {
      setPreviewData(null);
    }
  };

  const validateJson = (): boolean => {
    try {
      JSON.parse(jsonData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const processData = async (): Promise<IngestionResult> => {
    const targetIndex = createNewIndex ? newIndexName : selectedIndex;
    
    if (!targetIndex) {
      throw new Error('Please select or create an index');
    }

    const data = JSON.parse(jsonData);
    
    // Create new index if needed
    if (createNewIndex) {
      await ElasticsearchService.createIndex(targetIndex, {
        mappings: {
          properties: {
            // Dynamic mapping will be used
          }
        }
      });
    }

    // Handle different data formats
    if (Array.isArray(data)) {
      // Bulk insert for array of documents
      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        try {
          const docId = data[i].id || data[i]._id || `doc_${Date.now()}_${i}`;
          await ElasticsearchService.indexDocument(targetIndex, docId, data[i]);
          successCount++;
        } catch (error) {
          errors.push(`Document ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: successCount > 0,
        message: `Processed ${successCount} out of ${data.length} documents`,
        documentsProcessed: successCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } else {
      // Single document
      const docId = data.id || data._id || `doc_${Date.now()}`;
      await ElasticsearchService.indexDocument(targetIndex, docId, data);
      
      return {
        success: true,
        message: 'Document successfully ingested',
        documentsProcessed: 1
      };
    }
  };

  const handleIngest = async () => {
    if (!validateJson()) {
      setResult({
        success: false,
        message: 'Invalid JSON format. Please check your data.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const ingestionResult = await processData();
      setResult(ingestionResult);
      
      // Refresh indices list if new index was created
      if (createNewIndex) {
        loadIndices();
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to ingest data'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setJsonData('');
    setPreviewData(null);
    setResult(null);
    setNewIndexName('');
    setCreateNewIndex(false);
  };

  const sampleData = `[
  {
    "id": "1",
    "title": "Sample Document 1",
    "content": "This is the content of the first document",
    "category": "example",
    "created_at": "2024-01-01T00:00:00Z",
    "tags": ["sample", "test"]
  },
  {
    "id": "2",
    "title": "Sample Document 2",
    "content": "This is the content of the second document",
    "category": "example",
    "created_at": "2024-01-02T00:00:00Z",
    "tags": ["sample", "demo"]
  }
]`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Data Ingestion</h2>
        <p className="text-gray-400">Upload JSON files or paste data to ingest into Elasticsearch</p>
      </div>

      {/* Configuration */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
        
        {/* Index Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                checked={!createNewIndex}
                onChange={() => setCreateNewIndex(false)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-300">Use existing index</span>
            </label>
            {!createNewIndex && (
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select an index...</option>
                {indices.map(index => (
                  <option key={index} value={index}>{index}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                checked={createNewIndex}
                onChange={() => setCreateNewIndex(true)}
                className="text-blue-600"
              />
              <span className="text-sm font-medium text-gray-300">Create new index</span>
            </label>
            {createNewIndex && (
              <input
                type="text"
                value={newIndexName}
                onChange={(e) => setNewIndexName(e.target.value)}
                placeholder="Enter new index name"
                className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Data Input */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Data Input</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setInputMethod('file')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              File Upload
            </button>
            <button
              onClick={() => setInputMethod('text')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                inputMethod === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Text Input
            </button>
          </div>
        </div>

        {inputMethod === 'file' ? (
          <div className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                {file ? file.name : 'Click to upload JSON file'}
              </p>
              <p className="text-sm text-gray-400">
                Supports single documents or arrays of documents
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">JSON Data</label>
              <button
                onClick={() => handleTextChange(sampleData)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Load Sample Data
              </button>
            </div>
            <textarea
              value={jsonData}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your JSON data here..."
              rows={12}
              className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Preview */}
      {previewData && (
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Data Preview</h3>
          <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            {Array.isArray(previewData) 
              ? `Array with ${previewData.length} document${previewData.length !== 1 ? 's' : ''}`
              : 'Single document'
            }
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={clearAll}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
          <span>Clear All</span>
        </button>
        
        <button
          onClick={handleIngest}
          disabled={loading || !jsonData || !validateJson() || (!selectedIndex && !newIndexName)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Play className="h-5 w-5" />
          <span>{loading ? 'Ingesting...' : 'Ingest Data'}</span>
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-lg p-6 ${
          result.success ? 'bg-emerald-900 border border-emerald-700' : 'bg-red-900 border border-red-700'
        }`}>
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${
                result.success ? 'text-emerald-300' : 'text-red-300'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </h4>
              <p className={`mt-1 ${
                result.success ? 'text-emerald-200' : 'text-red-200'
              }`}>
                {result.message}
              </p>
              {result.documentsProcessed && (
                <p className={`mt-1 text-sm ${
                  result.success ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  Documents processed: {result.documentsProcessed}
                </p>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-red-300 font-medium">Errors:</p>
                  <ul className="mt-1 text-sm text-red-200 space-y-1">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>• ... and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataIngestion;