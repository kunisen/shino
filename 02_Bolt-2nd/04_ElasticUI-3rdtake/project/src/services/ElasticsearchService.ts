export class ElasticsearchService {
  private static baseUrl = 'http://localhost:9200';
  private static apiKey: string | null = null;

  static setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  static clearApiKey() {
    this.apiKey = null;
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add API key authentication if available
    if (this.apiKey) {
      headers['Authorization'] = `ApiKey ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  static async checkHealth() {
    return this.request('/_cluster/health');
  }

  static async getIndices() {
    return this.request('/_cat/indices?format=json');
  }

  static async search(index: string, query: any) {
    return this.request(`/${index}/_search`, {
      method: 'POST',
      body: JSON.stringify(query),
    });
  }

  static async getMapping(index: string) {
    return this.request(`/${index}/_mapping`);
  }

  static async getDocument(index: string, id: string) {
    return this.request(`/${index}/_doc/${id}`);
  }

  static async deleteIndex(index: string) {
    return this.request(`/${index}`, {
      method: 'DELETE',
    });
  }

  static async createIndex(index: string, mapping: any) {
    return this.request(`/${index}`, {
      method: 'PUT',
      body: JSON.stringify(mapping),
    });
  }

  static async indexDocument(index: string, id: string, document: any) {
    return this.request(`/${index}/_doc/${id}`, {
      method: 'PUT',
      body: JSON.stringify(document),
    });
  }

  static async deleteDocument(index: string, id: string) {
    return this.request(`/${index}/_doc/${id}`, {
      method: 'DELETE',
    });
  }
}