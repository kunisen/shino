import React, { useState, useEffect } from 'react';
import { Search, Database, FileText, Settings, ChevronRight, AlertCircle, Key, Upload } from 'lucide-react';
import SearchInterface from './components/SearchInterface';
import IndexManager from './components/IndexManager';
import DocumentViewer from './components/DocumentViewer';
import DataIngestion from './components/DataIngestion';
import ApiKeyModal from './components/ApiKeyModal';
import { ElasticsearchService } from './services/ElasticsearchService';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Load API key from localStorage on startup
    const savedApiKey = localStorage.getItem('elasticsearch_api_key');
    if (savedApiKey) {
      ElasticsearchService.setApiKey(savedApiKey);
      setHasApiKey(true);
    }
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const health = await ElasticsearchService.checkHealth();
      setIsConnected(true);
      setConnectionError(null);
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect to Elasticsearch');
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    if (apiKey) {
      ElasticsearchService.setApiKey(apiKey);
      localStorage.setItem('elasticsearch_api_key', apiKey);
      setHasApiKey(true);
    } else {
      ElasticsearchService.clearApiKey();
      localStorage.removeItem('elasticsearch_api_key');
      setHasApiKey(false);
    }
    checkConnection();
  };

  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'indices', label: 'Indices', icon: Database },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'ingestion', label: 'Data Ingestion', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Elasticsearch UI
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  hasApiKey 
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={hasApiKey ? 'API Key configured' : 'Configure API Key'}
              >
                <Key className="h-5 w-5" />
              </button>
              <button
                onClick={checkConnection}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh connection"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Connection Error */}
      {connectionError && (
        <div className="bg-red-900 border-l-4 border-red-500 p-4 m-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-300">Connection Error</h3>
              <p className="text-sm text-red-200 mt-1">{connectionError}</p>
              <p className="text-xs text-red-300 mt-2">
                Make sure Elasticsearch is running on localhost:9200, CORS is enabled, and API key is valid.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-gray-800 rounded-lg p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800 rounded-lg p-6">
              {isConnected ? (
                <>
                  {activeTab === 'search' && <SearchInterface />}
                  {activeTab === 'indices' && <IndexManager />}
                  {activeTab === 'documents' && <DocumentViewer />}
                  {activeTab === 'ingestion' && <DataIngestion />}
                </>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-300 mb-2">
                    Not Connected to Elasticsearch
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Please ensure Elasticsearch is running on localhost:9200
                  </p>
                  <button
                    onClick={checkConnection}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
        currentApiKey={localStorage.getItem('elasticsearch_api_key') || ''}
      />
    </div>
  );
}

export default App;