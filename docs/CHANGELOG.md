# CloudOptimal AI - Changelog

All notable changes to the CloudOptimal AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **BREAKING: Migrated from Dagre to ELK.js** - Replaced abandoned Dagre layout engine with actively maintained ELK.js
  - Superior layered algorithm with orthogonal edge routing
  - Multi-directional handle positions (top/bottom/left/right) for cleaner connections
  - Intelligent utility node placement near connected nodes
  - Better handling of complex layouts and edge crossings
  - Reduced visual clutter with optimized node positioning
  - Package changes: Added `elkjs@0.11.0`, removed `dagre@0.8.5` and `@types/dagre@0.7.53`

- **Removed Redundant Summary Section** - Streamlined results display by eliminating duplicate content
  - Summary section was repeating WAF content and next steps
  - Moved "Why [Provider]?" callout to appear after recommendation header
  - Cleaner information hierarchy with focused content
  - Better user experience with less scrolling and redundancy

- **UI/UX Polish and Refinements**
  - Fixed light mode color issues in index.css (removed dark color defaults)
  - Reduced "How It Works" initial display from 5 to 3 steps for balanced layout
  - Limited "Key Benefits" to 3 items initially to match "How It Works"
  - Added character limits to WAF boxes (80 chars) with See More/Less expansion
  - WAF boxes maintain square shape with `min-h-[180px]` for visual consistency

- **React Flow Theme Integration** - Diagram now respects application theme toggle
  - Added `colorMode` prop to ReactFlow component
  - Automatically switches between light/dark mode based on ThemeContext
  - Consistent visual experience across all components

### Fixed
- **Session Loading Restoration** - Previously saved sessions now fully restore diagram and recommendation
  - Fixed session save to include `diagramData` and `recommendedProvider` objects
  - Proper handling of parsed vs extracted JSON data
  - Sessions now restore complete state without requiring new AI calls
  - Enables iterative design workflows and UI testing without API costs

- **AI Prompt Improvements** - Strengthened validation to prevent content duplication
  - Enhanced summary field instructions to exclude next steps
  - Added CRITICAL warnings against including implementation steps in summary
  - Updated recommended_architecture to max 80 characters
  - Justification limited to 2-3 sentences under 200 words
  - Updated connection guidelines for utility node placement

- **Diagram Layout Issues**
  - Utility nodes (monitoring, logging, IAM) now positioned near their targets
  - Fixed edge crossings with multi-directional handle support
  - Improved visual clarity with centered utility placement above connected nodes
  - Added loading state during async ELK layout calculation

### Enhanced
- **ArchitectureDiagram Component** - Complete rewrite with ELK.js integration
  - Custom node component with 4-directional handles (top/bottom/left/right)
  - Async layout calculation with proper loading states
  - Intelligent node classification (main flow vs utility nodes)
  - Utility nodes positioned above and centered relative to targets
  - Theme-aware rendering with `useTheme()` hook
  - Better error handling with fallback positioning

- **ComprehensiveResults Component** - Multiple improvements for better UX
  - Removed summary section entirely for cleaner flow
  - Provider rationale callout moved to top (after header, before How It Works)
  - Balanced two-column layout with matching item counts
  - WAF boxes with expandable content and uniform heights
  - See More/Less functionality for both How It Works and WAF content

### Technical
- **Dependency Updates**
  - Added: `elkjs@0.11.0` - Modern graph layout library
  - Removed: `dagre@0.8.5`, `@types/dagre@0.7.53` - Abandoned since 2017
  - ELK.js provides better performance and active maintenance

- **Layout Algorithm**
  - ELK layered algorithm with configurable spacing and direction
  - Node classification system (main flow vs utility nodes)
  - Target-aware positioning for utility nodes
  - Orthogonal edge routing for professional appearance
  - Free port constraints for optimal handle selection

- **State Management**
  - Added `wafExpanded` state object for individual WAF box expansion
  - Unified `howItWorksExpanded` controls both How It Works and Key Benefits
  - Proper session data persistence with complete JSON structure
  - Theme state integration via React Context

---

## [1.3.1] - 2025-12-01

### Changed
- **Left Panel Redesign** - Restructured left panel to match modern design patterns
  - Page title with icon (Sparkles/Code2) now at top of left panel
  - Moved SessionHistory to bottom, below the prompt form
  - Simplified PromptInput to clean form layout without card wrapper
  - Added "PROMPT TYPE" and "REQUIREMENTS DESCRIPTION" labels with uppercase tracking
  - Single "New Analysis" button instead of two buttons after results
  - Removed gradients and card styling for cleaner appearance
  - Added lucide-react icons (Sparkles, Code2, Loader2)

### Fixed
- **Mermaid Diagram Parsing** - Reverted from architecture-beta to flowchart TD syntax due to parsing errors
- **Session Loading** - Fixed missing diagram and recommendation when loading from previous sessions
- **Empty State Layout** - Fixed excessive whitespace on first page load, empty state now properly centered
- **Left Panel Scrolling** - Improved scroll behavior with flex-1 and overflow-y-auto on inner container
- **Body CSS Layout** - Removed conflicting flex/center styling from body element that prevented proper viewport usage

---

## [1.3.0] - 2025-11-17

### Modern Dashboard UI Redesign

- **Split-Panel Layout Architecture**
  - **NEW: Resizable Split-Panel Interface** - Modern dashboard with draggable divider between left and right panels (25-60% width range)
  - **NEW: Static Left Panel** - Left panel remains visible with independent scroll, never scrolls with right content
  - **NEW: Scrollable Right Panel** - Right panel handles overflow independently for diagrams and detailed results
  - **NEW: Full Viewport Usage** - Pages now use `h-screen` to fill entire viewport before and after submission
  - Removed redundant page title header that duplicated prompt box information

- **Enhanced User Flow**
  - **NEW: Context-Aware Left Panel** - Displays prompt input before submission, recommendation card after submission
  - **NEW: Action Buttons After Results** - "New Design" and "Iterate on Design" buttons replace prompt input after AI generation
  - **NEW: Single Loading State** - Consolidated loading indicator in one location (prompt button only)
  - **NEW: Recommendation Card with Provider Icons** - AWS/Azure/GCP branded cards with color-coded styling
  - Improved user experience with clear state transitions between prompt and results

- **Streamlined Results Display**
  - **NEW: Optimized Section Order** - Resource Table → Summary → CSP Comparison Table (removed intermediate sections)
  - **REMOVED: Duplicate Recommendation Section** - Recommendation now only appears in left panel card, not repeated under diagram
  - **REMOVED: Migration Strategy, Tradeoffs, Optimization sections** - Simplified to core results only
  - Enhanced visual clarity by removing redundant information
  - Better information hierarchy with focused content presentation

- **Modern Component Styling**
  - **PromptInput**: Gradient headers (blue-to-indigo), enhanced button styling, removed Clear button
  - **SessionHistory**: Purple/pink gradient header, modern card layout, improved button designs
  - **DiagramView**: Blue gradient header with architecture icon, enhanced container styling
  - **ResultDisplay**: Blue gradient header with document icon, refined table styling
  - **RecommendationCard**: Provider-specific branding with AWS (orange), Azure (blue), GCP (multi-color) themes
  - **ResizableDivider**: Smooth drag interaction with percentage-based constraints

- **Architecture Diagram Improvements**
  - **NEW: architecture-beta Mermaid Syntax** - Updated prompt templates to use modern architecture-beta diagram type
  - Enhanced diagram rendering with groups and service icons for cloud services
  - Improved diagram styling with modern cloud architecture visualization
  - Better error handling and fallback to architecture-beta prefix

### Enhanced
- **Visual Design System**
  - Dark mode: Deep blue-black gradients (`gray-950`, `blue-950`) with purple/blue accents
  - Light mode: White/light grey gradients with colorful section accents
  - Consistent gradient backgrounds throughout all components
  - Enhanced shadows, borders, and hover states for better interactivity
  - Professional color scheme with blue (primary), purple (sessions), provider-specific colors

- **Component Architecture**
  - Simplified prop passing between components (removed unused `onClearSession`)
  - Better state management for recommendation display
  - Improved loading state handling with single source of truth
  - Enhanced conditional rendering based on AI response state

### Fixed
- **Layout Issues**
  - Fixed left panel scrolling with right panel (now independent with `overflow-y-auto`)
  - Fixed viewport responsiveness before prompt submission (now uses `h-screen` and `min-h-full`)
  - Removed duplicate page title header that repeated prompt box text
  - Fixed empty state placeholder taking insufficient space

- **User Experience Problems**
  - Fixed duplicate loading messages in prompt button and separate loading indicator
  - Removed duplicate recommended solution display (was showing in both card and detailed results)
  - Fixed section order confusion by reorganizing to logical flow
  - Improved button labels and actions ("New Design" and "Iterate on Design")

- **Display Inconsistencies**
  - Removed redundant sections that cluttered the results view
  - Fixed recommendation extraction to properly handle both single and multi-provider formats
  - Improved recommendation card to show architecture and reasoning clearly
  - Enhanced empty state messaging and icon sizing

### Technical
- **ResizableDivider Component** - New draggable vertical divider with mouse event handling and width constraints
- **RecommendationCard Component** - Provider-specific recommendation display with react-icons integration
- **Layout System** - Flexbox-based split panel with independent overflow handling
- **State Management** - Enhanced state variables for leftWidth, recommendedProvider, and response visibility
- **Mermaid Integration** - Updated to support architecture-beta syntax with automatic prefix detection
- **CSS Improvements** - Gradient backgrounds, shadow systems, modern color palette throughout

---

## [1.2.0] - 2025-11-10

### Professional Diagram Rendering and Enhanced Summary Formatting

- **Mermaid Diagram Integration**
  - **NEW: Complete Mermaid.js Integration** - Professional architecture diagrams now render properly using Mermaid library
  - **NEW: Comprehensive Diagram Debugging** - Added test functionality and detailed logging to troubleshoot diagram rendering
  - **NEW: Architecture Diagram Validation** - Ensures AI-generated Mermaid code is valid and renders correctly
  - Fixed diagram rendering pipeline with proper async handling and error recovery
  - Enhanced JSON parsing with automatic syntax error correction (trailing commas, malformed JSON)

- **Enhanced Summary Display**
  - **NEW: Markdown Typography Rendering** - Bold text (`**Bold**`) now displays as proper HTML bold formatting
  - **NEW: Structured Summary Layout** - Long summaries broken into readable sections with visual hierarchy
  - **NEW: Color-Coded Content Sections** - Blue for key benefits, green for implementation steps
  - **NEW: Numbered Benefits with Icons** - Visual numbered circles for key architecture benefits
  - **NEW: Next Steps Implementation Guide** - Structured action items with clear formatting
  - Improved readability with proper paragraph breaks and semantic spacing

- **AI Model Optimization**
  - **Updated Model Priority List** - Focus on latest Gemini 2.5 and 2.0 models as requested
  - **Enhanced Rate Limiting** - Increased to 10 seconds between requests to prevent 429 errors
  - **Improved Error Handling** - Better debugging for model availability and API issues
  - **JSON Syntax Auto-Correction** - Automatically fixes common JSON errors (trailing commas)
  - Added model availability debugging with `debugListModels()` browser console function

### Enhanced
- **Response Processing Pipeline**
  - Improved JSON parsing with fallback extraction and error correction
  - Better handling of malformed AI responses with comprehensive error logging
  - Enhanced debugging infrastructure for troubleshooting AI generation issues

- **Professional UI Polish**
  - Summary sections now use proper typography with bold headings and structured content
  - Consistent color scheme throughout: blue for benefits, green for actions
  - Better visual hierarchy with numbered icons and semantic spacing
  - Enhanced readability with markdown-to-HTML conversion for formatted text

### Fixed
- **Diagram Rendering Issues**
  - Fixed Mermaid diagrams not displaying by implementing proper library integration
  - Resolved JSON parsing errors that prevented diagram extraction
  - Added comprehensive error handling and debugging for diagram generation pipeline
  - Fixed async rendering issues with proper Mermaid initialization

- **Summary Formatting Problems**
  - Fixed long text walls that were difficult to read
  - Resolved markdown formatting (`**bold**`) displaying as plain text instead of HTML
  - Improved paragraph structure with proper breaks and visual organization
  - Enhanced implementation steps display with clear action items

- **API Reliability**
  - Fixed model selection to use latest available Gemini models (2.5, 2.0)
  - Resolved 429 rate limiting errors with increased delay between requests
  - Improved model fallback logic with better error messages
  - Enhanced debugging capabilities for API troubleshooting

### Technical
- **Mermaid Library Integration**
  - Added Mermaid dependency with proper initialization and async rendering
  - Implemented comprehensive test functionality for diagram validation
  - Enhanced error reporting with detailed console logging
  - Added diagram debugging infrastructure for troubleshooting

- **Advanced Text Processing**
  - Implemented markdown parsing for typography rendering in summaries
  - Added smart text segmentation for improved readability
  - Enhanced content structure detection for numbered benefits and steps
  - Improved semantic formatting with context-aware styling

---

## [1.1.0] - 2025-11-10

### Major UI/UX and Response Structure Overhaul

- **Enhanced Response Display System**
  - **NEW: Recommended Solution Box** - Prominent display of recommended cloud provider and architecture with clear justification
  - **NEW: Resource Architecture Table** - Comprehensive table showing resources, SKUs/tiers, descriptions, Well-Architected patterns, and monthly costs
  - **NEW: Cloud Provider Comparison Table** - Side-by-side comparison of AWS, Azure, and GCP services with cost totals
  - **NEW: Objective Tradeoffs Analysis** - Balanced analysis showing advantages, disadvantages, and key considerations
  - Fixed duplicate summary issue - now displays single summary after comparison table
  - Improved visual hierarchy with color-coded sections and professional styling

- **Multi-Cloud Strategy Support**
  - **NEW: Multi-Cloud Architecture Prompt** - Fourth prompt option for multi-provider strategies
  - Multi-cloud specific JSON structure with primary/secondary provider analysis
  - Cross-cloud integration patterns and deployment strategies
  - Implementation phases with timeline and risk mitigation
  - Cost comparison showing single-cloud vs multi-cloud premiums
  - Multi-provider resource table with deployment strategy column

- **Professional Diagram Generation**
  - Enhanced Mermaid diagram requirements focusing on infrastructure components only
  - Removed external entities (like "Users") from diagrams for cleaner architecture focus
  - Added specific shape requirements (rectangles for compute, cylinders for databases)
  - Improved diagram consistency with resource tables
  - Professional cloud architecture styling guidelines

### Enhanced
- **Response Consistency**
  - Fixed resource count discrepancies between tables and diagrams
  - Enforced exact matching between resource_table and csp_comparison_table
  - Added critical formatting requirements to ensure AI follows structured JSON format
  - Improved prompt instructions for objective, technical language vs marketing speak

- **ResultDisplay Component**
  - Dynamic table headers for single-provider vs multi-provider responses
  - Backward compatibility with legacy JSON structures
  - Enhanced cost display with multi-cloud totals and premiums
  - Professional table styling with proper borders and spacing
  - Responsive design for mobile and desktop viewing

### Added
- **Multi-Provider Prompt Template**
  - Specialized expertise in multi-cloud and hybrid-cloud architectures
  - Cross-cloud data synchronization and replication patterns
  - Hybrid connectivity options (ExpressRoute, DirectConnect, Cloud Interconnect)
  - Multi-cloud security and compliance frameworks
  - Vendor lock-in mitigation strategies

- **Enhanced JSON Structure Support**
  - Single-provider format: `recommended_provider`, `recommended_architecture`
  - Multi-provider format: `primary_provider`, `secondary_provider`, `multi_cloud_strategy`
  - Migration strategy object with phased implementation approach
  - Cost comparison with single-cloud vs multi-cloud analysis

### Fixed
- **AI Response Quality**
  - Eliminated "AWS marketing" style responses in favor of objective analysis
  - Fixed missing components in AI responses (recommended solution box, resource table, CSP comparison)
  - Improved JSON format compliance with explicit formatting requirements
  - Enhanced diagram generation with infrastructure-only focus

- **Data Consistency**
  - Fixed resource count mismatches between different sections
  - Ensured consistent naming and ordering across all tables
  - Improved resource table accuracy with proper SKU and cost information

### Technical
- **Component Architecture**
  - Enhanced ResultDisplay with conditional rendering for different JSON structures
  - Improved table responsiveness and styling
  - Added support for migration strategy display
  - Better error handling for malformed AI responses

---

## [1.0.0] - 2025-11-08

### Major Framework Integration (v0.3.0)
- **Comprehensive Framework-Based AI System**
  - Integrated Microsoft Cloud Adoption Framework (CAF) methodology across all prompts
  - Implemented Well-Architected Framework principles for all 5 pillars
  - Removed generic responses in favor of expert-level, framework-guided recommendations
  - Added comprehensive tradeoff analysis and detailed reasoning for all recommendations

### Enhanced
- **Prompt System Overhaul**
  - Updated Design prompt with detailed CSP comparison matrix and service architecture tables
  - Enhanced Optimize prompt with Well-Architected assessment and priority matrix
  - Improved Migrate prompt with CAF-based migration waves and governance framework
  - Removed separate CAF/WA prompts - integrated into core Design/Optimize/Migrate workflows
  - Added detailed cost breakdowns with justification and ROI analysis

- **Response Quality Improvements**
  - Primary recommendation with clear reasoning and architecture pattern identification
  - Service architecture table showing components, resources, WA areas, and costs
  - CSP comparison matrix with criteria-based analysis and winner identification
  - Explicit tradeoffs analysis with alternatives considered and risk mitigation
  - Executive summaries that explain WHY recommendations solve specific business needs

- **Cloud Provider Analysis**
  - Objective, unbiased multi-CSP analysis (removed Microsoft bias)
  - Framework-based methodology using industry best practices
  - Detailed cost comparisons with transparent calculation methods
  - Architecture pattern recommendations based on specific business requirements

### Fixed
- **Template Structure Issues**
  - Fixed "undefined is not an object" error in prompt template handling
  - Corrected prompt template format to match expected structure
  - Updated AI service to use correct Gemini 2.0 Flash model
  - Streamlined prompt options to core three: Design, Optimize, Migrate

- **AI Response Quality**
  - Eliminated generic recommendations lacking business context
  - Added requirement for detailed reasoning and justification in all responses
  - Implemented comprehensive comparison tables for informed decision-making
  - Enhanced diagram generation with context-aware architecture components

### Technical
- **Framework Integration**
  - All prompts now incorporate CAF 9-phase methodology (Strategy, Plan, Ready, Migrate, Modernize, Cloud-Native, Govern, Secure, Manage)
  - Well-Architected principles integrated across Reliability, Security, Cost, Operations, Performance
  - Design review checklists generated for each WA pillar
  - Maturity model assessments with 5-level progression paths

### Added
- **Dark/Light Mode Toggle**
  - Theme toggle button with sun/moon icons from react-icons
  - System preference detection for initial theme
  - LocalStorage persistence of theme preference
  - Comprehensive dark mode styling across all components

### Previous Fixes
- **Gemini API Integration**
  - Switched to official Google Generative AI SDK for better reliability
  - **Optimized for free tier Gemini Flash models** (gemini-2.0-flash, gemini-1.5-flash)
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