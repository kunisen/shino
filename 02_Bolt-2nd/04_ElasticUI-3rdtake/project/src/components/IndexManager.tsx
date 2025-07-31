import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, FileText, Edit, Eye } from 'lucide-react';
import { ElasticsearchService } from '../services/ElasticsearchService';

interface Index {
  index: string;
  health: string;
  status: string;
  pri: string;
  rep: string;
  'docs.count': string;
  'store.size': string;
}

const IndexManager: React.FC = () => {
  const [indices, setIndices] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIndexName, setNewIndexName] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [indexMapping, setIndexMapping] = useState<any>(null);

  useEffect(() => {
    loadIndices();
  }, []);

  const loadIndices = async () => {
    try {
      const indicesData = await ElasticsearchService.getIndices();
      setIndices(indicesData);
    } catch (error) {
      console.error('Error loading indices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    if (!newIndexName.trim()) return;

    try {
      await ElasticsearchService.createIndex(newIndexName, {
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' },
            created_at: { type: 'date' },
          },
        },
      });
      setShowCreateModal(false);
      setNewIndexName('');
      loadIndices();
    } catch (error) {
      console.error('Error creating index:', error);
    }
  };

  const handleDeleteIndex = async (indexName: string) => {
    if (!confirm(`Are you sure you want to delete the index "${indexName}"?`)) return;

    try {
      await ElasticsearchService.deleteIndex(indexName);
      loadIndices();
    } catch (error) {
      console.error('Error deleting index:', error);
    }
  };

  const handleViewMapping = async (indexName: string) => {
    try {
      const mapping = await ElasticsearchService.getMapping(indexName);
      setIndexMapping(mapping);
      setSelectedIndex(indexName);
    } catch (error) {
      console.error('Error loading mapping:', error);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'bg-emerald-600';
      case 'yellow': return 'bg-yellow-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading indices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Index Management</h2>
          <p className="text-gray-400">Manage your Elasticsearch indices</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Index</span>
        </button>
      </div>

      {/* Indices Table */}
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-600">
            <tr>
              <th className="text-left px-6 py-4 text-gray-300 font-medium">Index</th>
              <th className="text-left px-6 py-4 text-gray-300 font-medium">Health</th>
              <th className="text-left px-6 py-4 text-gray-300 font-medium">Status</th>
              <th className="text-left px-6 py-4 text-gray-300 font-medium">Documents</th>
              <th className="text-left px-6 py-4 text-gray-300 font-medium">Size</th>
              <th className="text-right px-6 py-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {indices.map((index) => (
              <tr key={index.index} className="hover:bg-gray-600 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">{index.index}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getHealthColor(index.health)}`}>
                    {index.health}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{index.status}</td>
                <td className="px-6 py-4 text-gray-300">
                  {parseInt(index['docs.count']).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-gray-300">{index['store.size']}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewMapping(index.index)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg transition-colors"
                      title="View Mapping"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIndex(index.index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                      title="Delete Index"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Index Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Index</h3>
            <input
              type="text"
              value={newIndexName}
              onChange={(e) => setNewIndexName(e.target.value)}
              placeholder="Index name"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIndex}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {selectedIndex && indexMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Mapping for {selectedIndex}
              </h3>
              <button
                onClick={() => {
                  setSelectedIndex(null);
                  setIndexMapping(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(indexMapping, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexManager;