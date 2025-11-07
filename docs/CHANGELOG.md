# CloudOptimal AI - Changelog

All notable changes to the CloudOptimal AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Dark/Light Mode Toggle**
  - Theme toggle button with sun/moon icons from react-icons
  - System preference detection for initial theme
  - LocalStorage persistence of theme preference
  - Comprehensive dark mode styling across all components

### Enhanced
- **Prompt Selection UI**
  - Improved visibility of selected prompt type
  - Added visual indicator showing current selection
  - Better contrast and styling for dropdown selection
  - Enhanced user feedback for prompt type changes

### Fixed
- **Gemini API Integration**
  - Switched to official Google Generative AI SDK for better reliability
  - **Optimized for free tier Gemini Flash models** (gemini-1.5-flash, gemini-flash)
  - Added dynamic model discovery with prioritization for free tier models
  - Added fallback model support and better error handling
  - Fixed "model not found" errors with proper model detection
  - Enhanced debugging tools to identify available free vs paid models

### Planned
- **LLM Provider Roadmap**
  - Phase 1 (MVP): Gemini 1.5 Flash (free tier) for rapid development and testing
  - Phase 2 (Production): Migrate to GPT-4o-mini for improved accuracy and reliability
  - Future: Multi-provider support with fallback mechanisms
- Cost comparison tables across cloud providers
- PDF export functionality for recommendations
- Multi-user support for consultant teams
- Enhanced diagram customization options
- Integration with cloud provider APIs for real-time pricing

---

## [0.2.0] - 2025-11-06

### Added
- **Session Management System**
  - LocalStorage-based session history
  - Load and replay previous AI consultations
  - Session deletion and management interface
  - Automatic session saving after successful AI calls
  - Maximum 10 sessions stored locally

- **Enhanced AI Integration**
  - Structured JSON prompt templates for consistent AI responses
  - Improved response parsing with fallback text extraction
  - Better error handling with specific API error messages
  - Loading states with spinner and disabled UI during API calls

- **Professional UI/UX**
  - Enhanced PromptInput component with detailed descriptions
  - Structured ResultDisplay showing parsed recommendations in cards
  - Improved DiagramView with better empty states and styling
  - Session History component with expandable interface
  - Professional styling throughout with Tailwind CSS

- **Architecture Diagram Support**
  - React Flow integration for interactive diagrams
  - JSON-based node and edge parsing from AI responses
  - Visual architecture representation for design prompts
  - MiniMap and Controls for diagram navigation

### Enhanced
- **Prompt Templates**
  - Design prompt with structured architecture recommendations
  - Optimize prompt with cost analysis and priority actions
  - Migrate prompt with step-by-step migration plans
  - All prompts now request structured JSON responses

- **Error Handling**
  - Comprehensive API error messages
  - Environment variable validation
  - Build-time error checking
  - User-friendly error display

### Fixed
- **Dependency Compatibility**
  - Downgraded React from 19.x to 18.2.0 for react-flow-renderer compatibility
  - Fixed import/export mismatches between prompt files and App.jsx
  - Resolved CommonJS vs ES modules conflicts

- **Development Environment**
  - Fixed Tailwind CSS v3 setup with proper configuration
  - Resolved Vite build configuration issues
  - Updated package.json dependencies

### Technical
- Added session storage utilities (`src/utils/sessionStorage.js`)
- Enhanced AI service with better error handling (`src/services/aiService.js`)
- Converted prompt files from CommonJS to ES modules
- Added comprehensive environment variable setup

---

## [0.1.0] - 2025-11-06

### Added
- **Initial Project Setup**
  - React 18 application with Vite build system
  - TailwindCSS for styling
  - ESLint configuration for code quality

- **Core Components**
  - `PromptInput.jsx` - Form for selecting prompt types and entering workload descriptions
  - `ResultDisplay.jsx` - Display component for AI recommendations
  - `DiagramView.jsx` - React Flow integration for architecture diagrams
  - Basic routing and state management

- **AI Service Foundation**
  - Google Gemini API integration stub
  - Basic prompt template structure
  - Environment variable configuration for API keys

- **Prompt Templates** (Initial versions)
  - `designPrompt.js` - Cloud architecture design recommendations
  - `optimizePrompt.js` - Infrastructure optimization suggestions
  - `migratePrompt.js` - Migration planning from on-premises to cloud

### Infrastructure
- Vite configuration for fast development builds
- Package.json with all required dependencies
- Basic project structure following React best practices

---

## Development Notes

### Version Numbering
- **Major versions (x.0.0)**: Breaking changes, major feature additions
- **Minor versions (0.x.0)**: New features, enhancements, non-breaking changes
- **Patch versions (0.0.x)**: Bug fixes, minor improvements

### Release Process
1. Update version in `package.json`
2. Update this changelog with new version section
3. Test all functionality thoroughly
4. Create git tag with version number
5. Deploy to production environment

### Contributing
When adding new features or fixes:
1. Add entry to "Unreleased" section
2. Use appropriate category (Added/Enhanced/Fixed/Technical)
3. Include brief description and affected files/components
4. Move to versioned section when releasing

---

## Future Roadmap

### v0.3.0 - Enhanced Analytics
- Cost comparison tables between AWS, Azure, and GCP
- Performance metrics and optimization tracking
- Integration with cloud provider pricing APIs
- Enhanced diagram generation with cost annotations

### v0.4.0 - Collaboration Features
- Multi-user session sharing
- Team workspace functionality
- Comment and annotation system
- Export to PDF and other formats

### v1.0.0 - Production Ready
- Enterprise authentication and authorization
- Advanced analytics and reporting
- API rate limiting and caching
- Full documentation and deployment guides