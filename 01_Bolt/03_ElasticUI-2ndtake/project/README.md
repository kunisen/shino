# Elasticsearch Frontend UI

A beautiful, production-ready frontend interface for Elasticsearch with modern design and comprehensive functionality.

## Features

- **Search Interface**: Advanced search with field selection and real-time results
- **Index Management**: Create, view, and delete Elasticsearch indices
- **Document Viewer**: Browse, create, and manage documents
- **API Key Authentication**: Secure authentication with Elasticsearch
- **Modern UI**: Dark theme with responsive design
- **Real-time Connection Status**: Live connection monitoring

## Prerequisites

- Node.js 18+ installed
- Elasticsearch running on localhost:9200
- CORS enabled in Elasticsearch (see setup below)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

## Elasticsearch Setup

### Enable CORS

Add these lines to your `elasticsearch.yml` file:

```yaml
http.cors.enabled: true
http.cors.allow-origin: "*"
http.cors.allow-headers: "X-Requested-With,Content-Type,Content-Length,Authorization"
```

Then restart Elasticsearch.

### Create API Key (Optional but Recommended)

```bash
curl -X POST "localhost:9200/_security/api_key" \
-H "Content-Type: application/json" \
-d '{"name": "frontend-ui-key", "role_descriptors": {}}'
```

Or use Kibana: Stack Management → Security → API Keys

## Usage

1. **Configure API Key**: Click the key icon in the header to add your API key
2. **Search Documents**: Use the search interface to query your data
3. **Manage Indices**: Create, view, and delete indices
4. **Browse Documents**: View and manage individual documents

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Elasticsearch REST API** for data operations

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchInterface.tsx
│   ├── IndexManager.tsx
│   ├── DocumentViewer.tsx
│   └── ApiKeyModal.tsx
├── services/           # API services
│   └── ElasticsearchService.ts
├── App.tsx            # Main application
└── main.tsx           # Entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.