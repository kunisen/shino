import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, Plus, Eye, Search } from 'lucide-react';
import { ElasticsearchService } from '../services/ElasticsearchService';

interface Document {
  _index: string;
  _id: string;
  _source: any;
  _version?: number;
}

const DocumentViewer: React.FC = () => {
  const [indices, setIndices] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocumentId, setNewDocumentId] = useState('');
  const [newDocumentData, setNewDocumentData] = useState('{\n  "title": "Sample Document",\n  "content": "This is a sample document",\n  "created_at": "2024-01-01T00:00:00Z"\n}');

  useEffect(() => {
    loadIndices();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      loadDocuments();
    }
  }, [selectedIndex]);

  const loadIndices = async () => {
    try {
      const indicesData = await ElasticsearchService.getIndices();
      const indexNames = indicesData.map((index: any) => index.index);
      setIndices(indexNames);
      if (indexNames.length > 0) {
        setSelectedIndex(indexNames[0]);
      }
    } catch (error) {
      console.error('Error loading indices:', error);
    }
  };

  const loadDocuments = async () => {
    if (!selectedIndex) return;

    setLoading(true);
    try {
      const response = await ElasticsearchService.search(selectedIndex, {
        query: { match_all: {} },
        size: 50,
      });
      setDocuments(response.hits.hits);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocumentId.trim() || !newDocumentData.trim()) return;

    try {
      const documentData = JSON.parse(newDocumentData);
      await ElasticsearchService.indexDocument(selectedIndex, newDocumentId, documentData);
      setShowCreateModal(false);
      setNewDocumentId('');
      setNewDocumentData('{\n  "title": "Sample Document",\n  "content": "This is a sample document",\n  "created_at": "2024-01-01T00:00:00Z"\n}');
      loadDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document. Please check the JSON format.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm(`Are you sure you want to delete document "${documentId}"?`)) return;

    try {
      await ElasticsearchService.deleteDocument(selectedIndex, documentId);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getValuePreview = (value: any): string => {
    const str = renderValue(value);
    return str.length > 100 ? str.substring(0, 100) + '...' : str;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Document Viewer</h2>
          <p className="text-gray-400">Browse and manage documents in your indices</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!selectedIndex}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Index Selection */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-300">Select Index:</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select an index...</option>
            {indices.map(index => (
              <option key={index} value={index}>{index}</option>
            ))}
          </select>
          <div className="text-sm text-gray-400">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading documents...</div>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((document) => (
            <div key={document._id} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">{document._id}</h3>
                    <p className="text-sm text-gray-400">Index: {document._index}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDocument(document)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg transition-colors"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document._id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {getValuePreview(document._source)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      ) : selectedIndex ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No documents found</h3>
          <p className="text-gray-400">This index doesn't contain any documents yet</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Select an index</h3>
          <p className="text-gray-400">Choose an index to view its documents</p>
        </div>
      )}

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document ID
                </label>
                <input
                  type="text"
                  value={newDocumentId}
                  onChange={(e) => setNewDocumentId(e.target.value)}
                  placeholder="Enter document ID"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Data (JSON)
                </label>
                <textarea
                  value={newDocumentData}
                  onChange={(e) => setNewDocumentData(e.target.value)}
                  rows={12}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Document: {selectedDocument._id}
              </h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {renderValue(selectedDocument._source)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;