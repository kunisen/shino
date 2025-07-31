import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, Star, Filter } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState<string>('my_score_g7');
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadIndices();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
      loadAvailableSubjects();
    }
  }, [selectedIndex]);

  const loadIndices = async () => {
    try {
      const indicesData = await ElasticsearchService.getIndices();
      const indexNames = indicesData.map((index: any) => index.index);
      setIndices(indexNames);
      
      // Prioritize my_score_g7 if it exists, otherwise use first available
      if (indexNames.includes('my_score_g7')) {
        setSelectedIndex('my_score_g7');
      } else if (indexNames.length > 0) {
        setSelectedIndex(indexNames[0]);
      }
    } catch (error) {
      console.error('Error loading indices:', error);
    }
  };

  const loadAvailableSubjects = async () => {
    if (!selectedIndex) return;
    
    setLoadingSubjects(true);
    setAvailableSubjects([]);
    
    try {
      // First, try to get subjects using aggregation on common subject field names
      const subjectFields = ['subject', 'Subject', 'category', 'Category', 'type', 'Type'];
      let subjects: string[] = [];
      
      for (const field of subjectFields) {
        try {
          const aggregationQuery = {
            size: 0,
            aggs: {
              subjects: {
                terms: {
                  field: `${field}.keyword`,
                  size: 100
                }
              }
            }
          };

          const response = await ElasticsearchService.search(selectedIndex, aggregationQuery);
          if (response.aggregations?.subjects?.buckets?.length > 0) {
            subjects = response.aggregations.subjects.buckets.map((bucket: any) => bucket.key);
            break; // Found subjects, stop trying other fields
          }
        } catch (error) {
          // Try next field
          continue;
        }
      }
      
      // If no subjects found via aggregation, try to sample documents and extract subjects
      if (subjects.length === 0) {
        try {
          const sampleQuery = {
            size: 100,
            query: { match_all: {} }
          };
          
          const response = await ElasticsearchService.search(selectedIndex, sampleQuery);
          const subjectSet = new Set<string>();
          
          response.hits.hits.forEach((hit: any) => {
            const source = hit._source;
            // Check various possible subject field names
            const possibleSubjects = [
              source.subject, source.Subject, 
              source.category, source.Category,
              source.type, source.Type,
              source.class, source.Class
            ].filter(Boolean);
            
            possibleSubjects.forEach(subject => {
              if (typeof subject === 'string' && subject.trim()) {
                subjectSet.add(subject.trim());
              }
            });
          });
          
          subjects = Array.from(subjectSet).sort();
        } catch (error) {
          console.error('Error sampling documents for subjects:', error);
        }
      }
      
      setAvailableSubjects(subjects);
      
      // If no subjects found, show a message
      if (subjects.length === 0) {
        console.log('No subjects found in the index. Make sure your documents have a subject field.');
      }
      
    } catch (error) {
      console.error('Error loading subjects:', error);
      setAvailableSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Alternative method to discover subjects by examining index mapping
  const loadSubjectsFromMapping = async () => {
    try {
      const mapping = await ElasticsearchService.getMapping(selectedIndex);
      const indexMapping = mapping[selectedIndex]?.mappings?.properties || {};
      
      // Look for subject-related fields in the mapping
      const subjectFields = Object.keys(indexMapping).filter(field => 
        field.toLowerCase().includes('subject') || 
        field.toLowerCase().includes('category') ||
        field.toLowerCase().includes('type') ||
        field.toLowerCase().includes('class')
      );
      
      console.log('Found potential subject fields:', subjectFields);
      return subjectFields;
    } catch (error) {
      console.error('Error examining index mapping:', error);
      return [];
    }
  };

  const handleIndexChange = (newIndex: string) => {
    setSelectedIndex(newIndex);
    setSelectedSubject('');
    setResults([]);
    setTotalHits(0);
  };

  const handleSearch = async () => {
    if (!selectedIndex) return;

    setLoading(true);
    try {
      let searchQuery: any = {
        size: 50,
      };

      // Build query based on selected subject and search text
      if (selectedSubject && query.trim()) {
        // Search within specific subject - try multiple field variations
        searchQuery.query = {
          bool: {
            should: [
              // Try different subject field names
              { match: { subject: selectedSubject } },
              { match: { Subject: selectedSubject } },
              { match: { category: selectedSubject } },
              { match: { Category: selectedSubject } },
              { match: { type: selectedSubject } },
              { match: { Type: selectedSubject } }
            ],
            minimum_should_match: 1,
            must: [
              {
                multi_match: {
                  query: query,
                  fields: ['title^2', 'content', 'description', 'text', 'body']
                }
              }
            ]
          }
        };
      } else if (selectedSubject) {
        // Only filter by subject - try multiple field variations
        searchQuery.query = {
          bool: {
            should: [
              { match: { subject: selectedSubject } },
              { match: { Subject: selectedSubject } },
              { match: { category: selectedSubject } },
              { match: { Category: selectedSubject } },
              { match: { type: selectedSubject } },
              { match: { Type: selectedSubject } }
            ],
            minimum_should_match: 1
          }
        };
      } else if (query.trim()) {
        // Only search by text
        searchQuery.query = {
          multi_match: {
            query: query,
            fields: ['title^2', 'content', 'description', 'text', 'body', 'subject', 'Subject', 'category']
          }
        };
      } else {
        // Show all documents
        searchQuery.query = {
          match_all: {}
        };
      }

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

  const clearFilters = () => {
    setSelectedSubject('');
    setQuery('');
    setResults([]);
    setTotalHits(0);
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getSubjectColor = (subject: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
      'bg-yellow-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600',
      'bg-orange-600', 'bg-cyan-600', 'bg-emerald-600', 'bg-rose-600'
    ];
    // Use a simple hash function to consistently assign colors
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Get the actual subject value from a document
  const getDocumentSubject = (source: any): string | null => {
    return source.subject || source.Subject || source.category || source.Category || 
           source.type || source.Type || source.class || source.Class || null;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Subject-Based Search</h2>
        <p className="text-gray-400">
          Search documents by subject categories from your <span className="text-blue-400 font-mono">my_score_g7</span> index
        </p>
      </div>

      {/* Search Controls */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-6">
        {/* Index Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Index
          </label>
          <select
            value={selectedIndex}
            onChange={(e) => handleIndexChange(e.target.value)}
            className="w-full md:w-1/2 bg-gray-600 text-white rounded-lg px-4 py-2 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select an index...</option>
            {indices.map(index => (
              <option key={index} value={index}>
                {index} {index === 'my_score_g7' ? '(Primary)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-300">
              Available Subjects {selectedIndex && `(from ${selectedIndex})`}
            </label>
            {loadingSubjects && (
              <div className="text-sm text-blue-400">Loading subjects...</div>
            )}
            {!loadingSubjects && availableSubjects.length === 0 && selectedIndex && (
              <div className="text-sm text-yellow-400">No subjects found in this index</div>
            )}
          </div>
          
          {availableSubjects.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(selectedSubject === subject ? '' : subject)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    selectedSubject === subject
                      ? `${getSubjectColor(subject)} text-white shadow-lg transform scale-105`
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{subject}</span>
                </button>
              ))}
            </div>
          ) : !loadingSubjects && selectedIndex ? (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <BookOpen className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-medium mb-1">No subjects detected in this index</p>
                  <p>Make sure your documents have a field like 'subject', 'category', or 'type' containing subject information.</p>
                  <p className="mt-2">You can still search all documents using the text search below.</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Text {selectedSubject ? `(within ${selectedSubject})` : '(all documents)'}
          </label>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search terms..."
                className="w-full bg-gray-600 text-white rounded-lg pl-12 pr-4 py-3 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !selectedIndex}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-colors flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedSubject || query) && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {selectedSubject && (
              <span className={`px-3 py-1 rounded-full text-xs text-white ${getSubjectColor(selectedSubject)}`}>
                Subject: {selectedSubject}
              </span>
            )}
            {query && (
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-600 text-white">
                Text: "{query}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Results Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>{totalHits.toLocaleString()} results</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{searchTime}ms</span>
              </span>
              {selectedSubject && (
                <span className={`px-2 py-1 rounded text-xs text-white ${getSubjectColor(selectedSubject)}`}>
                  {selectedSubject}
                </span>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, index) => {
              const documentSubject = getDocumentSubject(result._source);
              return (
                <div key={result._id} className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {result._index}
                      </div>
                      <div className="text-gray-400 text-sm">
                        ID: {result._id}
                      </div>
                      <div className="bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                        Score: {result._score.toFixed(2)}
                      </div>
                      {documentSubject && (
                        <div className={`text-white text-xs px-2 py-1 rounded ${getSubjectColor(documentSubject)}`}>
                          {documentSubject}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Document Preview */}
                  <div className="space-y-3">
                    {result._source.title && (
                      <h3 className="text-lg font-semibold text-white">
                        {result._source.title}
                      </h3>
                    )}
                    
                    {result._source.description && (
                      <p className="text-gray-300">
                        {result._source.description}
                      </p>
                    )}
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <pre className="text-sm text-gray-300 overflow-x-auto max-h-64 overflow-y-auto">
                        {renderValue(result._source)}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && (selectedSubject || query) && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No results found</h3>
          <p className="text-gray-400">
            {selectedSubject && query 
              ? `No documents found for "${selectedSubject}" containing "${query}"`
              : selectedSubject 
                ? `No documents found for subject "${selectedSubject}"`
                : `No documents found containing "${query}"`
            }
          </p>
        </div>
      )}

      {/* Welcome State */}
      {!loading && results.length === 0 && !selectedSubject && !query && selectedIndex && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">
            {availableSubjects.length > 0 ? 'Select a Subject to Begin' : 'Ready to Search'}
          </h3>
          <p className="text-gray-400">
            {availableSubjects.length > 0 
              ? 'Choose a subject category above to search for documents'
              : 'Use the search box above to find documents in your index'
            }
          </p>
        </div>
      )}

      {/* No Index Selected */}
      {!selectedIndex && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">Select an Index</h3>
          <p className="text-gray-400">Choose an index from the dropdown above to begin searching</p>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;