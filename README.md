# CloudOptimal AI

CloudOptimal AI is an MVP tool to help entrepreneurs, SMBs, and consultants plan, optimize, and migrate workloads across multi-cloud environments (AWS, Azure, GCP) using AI-assisted guidance.

## Features

- **Multi-cloud Architecture Recommendations**: Get AI-powered design suggestions across AWS, Azure, and GCP
- **Interactive Architecture Diagrams**: Custom SVG diagrams with layered architecture, zoom/pan controls, and tooltips
- **Cost Optimization**: Analyze existing infrastructure for cost and performance improvements
- **Migration Planning**: Generate migration plans from on-premises or legacy systems
- **Session Management**: Save and reload previous analyses
- **Dark Mode**: Full dark mode support throughout the application

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (get from [MakerSuite](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Usage

1. Select a prompt type (Design, Migrate, Optimize, or Compare)
2. Describe your workload or infrastructure requirements
3. Click "Get Recommendations" 
4. View AI-generated architecture with:
   - Interactive layered diagram (zoom, pan, hover for details)
   - Provider recommendation with reasoning
   - Detailed resource table with costs
   - Cloud service comparison table
   - Executive summary with next steps

## Key Features

### Custom Architecture Diagrams

The app generates interactive SVG diagrams organized into layers:
- **Presentation Layer**: CDN, Load Balancers, WAF
- **Application Layer**: Compute, APIs, Caching
- **Data Layer**: Databases, Object Storage
- **Security Layer**: IAM, Key Management, Logging

**Diagram Controls:**
- Mouse wheel to zoom (50%-300%)
- Click and drag to pan
- Hover over components for detailed tooltips
- Provider-specific color themes (AWS/Azure/GCP)

### Session Management

- Automatically saves all analyses
- Load previous sessions from history
- View past recommendations and diagrams

## Project Structure

```
src/
├── components/              # React components
│   ├── ArchitectureDiagram.jsx  # Custom SVG diagram renderer (NEW)
│   ├── DiagramView.jsx          # Diagram display wrapper
│   ├── PromptInput.jsx          # Input form for workload descriptions
│   ├── ResultDisplay.jsx        # AI response display
│   ├── RecommendationCard.jsx   # Provider recommendation display
│   ├── SessionHistory.jsx       # Previous sessions management
│   └── ResizableDivider.jsx     # Split-panel layout
├── schemas/                 # Data schemas and validation (NEW)
│   └── diagramSchema.js         # Architecture diagram JSON schema
├── prompts/                 # Structured AI prompt templates
│   ├── designPrompt.js          # New architecture design prompts
│   ├── optimizePrompt.js        # Optimization analysis prompts
│   ├── migratePrompt.js         # Migration planning prompts
│   └── multiProviderPrompt.js   # Multi-cloud comparison prompts
├── services/                # API and external services
│   └── aiService.js             # Gemini AI integration
├── pages/                   # Page components
│   ├── Home.jsx                 # Landing page
│   ├── DesignPage.jsx           # Architecture design flow
│   ├── MigratePage.jsx          # Migration planning flow
│   ├── OptimizePage.jsx         # Cost optimization flow
│   └── ComparePage.jsx          # Multi-cloud comparison
└── App.jsx                  # Main application component
```

## Tech Stack

- **Frontend**: React 18, Vite 7, TailwindCSS 3.4
- **Diagrams**: Custom SVG rendering with Lucide React icons
- **AI**: Google Gemini API (2.5 Flash & 2.0 Flash models)
- **Routing**: React Router DOM v6
- **Styling**: TailwindCSS with dark mode support

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Prompt Templates

1. Create a new file in `src/prompts/` following the existing structure
2. Export the template as default export
3. Add the template to the `templates` object in `App.jsx`

## Deployment

Build the project and deploy the `dist` folder to your preferred hosting platform:

```bash
npm run build
```

Remember to set the `VITE_GEMINI_API_KEY` environment variable in your production environment.

## Contributing

This is an MVP project. Current priorities are listed in `docs/copilotcontext.md`.

## License

MIT
