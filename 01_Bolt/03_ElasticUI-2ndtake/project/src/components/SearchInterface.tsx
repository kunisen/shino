import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock, Star } from 'lucide-react';
import { ElasticsearchService } from '../services/ElasticsearchService';

interface SearchResult {
  _index: string;
  _id: string;
  _score: number;
  _source: any;
}

interface SearchResponse {
  hits: {
    total: { value: number };
    hits: SearchResult[];
  };
  took: number;
}

const SearchInterface: React.FC = () => {
  const [indices, setIndices] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  useEffect(() => {
    loadIndices();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      loadFieldMapping();
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

  const loadFieldMapping = async () => {
    try {
      const mapping = await ElasticsearchService.getMapping(selectedIndex);
      const fields = Object.keys(mapping[selectedIndex]?.mappings?.properties || {});
      setAvailableFields(fields);
    } catch (error) {
      console.error('Error loading field mapping:', error);
    }
  };

  const handleSearch = async () => {
    if (!selectedIndex || !query.trim()) return;

    setLoading(true);
    try {
      const searchQuery = {
        query: {
          multi_match: {
            query: query,
            fields: selectedFields.length > 0 ? selectedFields : ['*'],
          },
        },
        size: 50,
      };

      const response: SearchResponse = await ElasticsearchService.search(selectedIndex, searchQuery);
      setResults(response.hits.hits);
      setTotalHits(response.hits.total.value);
      setSearchTime(response.took);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Search Documents</h2>
        <p className="text-gray-400">Search across your Elasticsearch indices</p>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Index
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
              className="w-full bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {indices.map(index => (
                <option key={index} value={index}>{index}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Fields
            </label>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
              {availableFields.map(field => (
                <button
                  key={field}
                  onClick={() => toggleField(field)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedFields.includes(field)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter search query..."
              className="w-full bg-gray-600 text-white rounded-lg pl-12 pr-4 py-3 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !selectedIndex || !query.trim()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Search className="h-5 w-5" />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Results Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{totalHits} results</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{searchTime}ms</span>
              </span>
            </div>
            <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Results</span>
            </button>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result._id} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {result._index}
                    </div>
                    <div className="text-gray-400 text-sm">
                      ID: {result._id}
                    </div>
                    <div className="bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                      Score: {result._score.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    {renderValue(result._source)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No results found</h3>
          <p className="text-gray-400">Try adjusting your search query or selected fields</p>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;