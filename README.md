# CloudOptimal AI

CloudOptimal AI is an MVP tool to help entrepreneurs, SMBs, and consultants plan, optimize, and migrate workloads across multi-cloud environments (AWS, Azure, GCP) using AI-assisted guidance.

## Features

- **Multi-cloud Architecture Recommendations**: Get AI-powered design suggestions across AWS, Azure, and GCP
- **Cost Optimization**: Analyze existing infrastructure for cost and performance improvements
- **Migration Planning**: Generate migration plans from on-premises or legacy systems
- **Visual Diagrams**: Interactive architecture diagrams using React Flow

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

1. Select a prompt type (Design, Optimize, or Migrate)
2. Describe your workload or infrastructure requirements
3. Click "Get AI Recommendations" 
4. View the AI response and any generated architecture diagrams

## Project Structure

```
src/
├── components/          # React components
│   ├── PromptInput.jsx     # Input form for workload descriptions
│   ├── ResultDisplay.jsx  # AI response display
│   └── DiagramView.jsx     # React Flow diagram renderer
├── prompts/             # Structured AI prompt templates
│   ├── designPrompt.js     # New architecture design prompts
│   ├── optimizePrompt.js   # Optimization analysis prompts
│   └── migratePrompt.js    # Migration planning prompts
├── services/            # API and external services
│   └── aiService.js        # Gemini AI integration
└── App.jsx             # Main application component
```

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Diagrams**: React Flow Renderer
- **AI**: Google Gemini API
- **HTTP**: Axios

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
