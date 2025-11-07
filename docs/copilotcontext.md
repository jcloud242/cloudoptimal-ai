CloudOptimal AI - Copilot Playbook

Project Overview

CloudOptimal AI is an MVP tool to help entrepreneurs, SMBs, and consultants plan, optimize, and migrate workloads across multi-cloud environments (AWS, Azure, GCP) using AI-assisted guidance.

Goals:
	•	Provide multi-cloud architecture recommendations
	•	Compare costs and features across CSPs
	•	Suggest optimizations for existing cloud setups
	•	Generate migration plans from on-prem or legacy systems

⸻

Current State
	•	React 18 project with Vite + TailwindCSS
	•	Structured JSON prompt templates in src/prompts:
	•	designPrompt.json
	•	optimizePrompt.json
	•	migratePrompt.json
	•	Components created:
	•	PromptInput.jsx → select prompt type & enter workload
	•	ResultDisplay.jsx → display AI response
	•	DiagramView.jsx → render architecture diagram with React Flow
	•	AI service stub ready to call Gemini API with VITE_GEMINI_API_KEY

⸻

Current Issue
	•	Dev server currently fails due to dependency resolution / Vite import errors with react-flow-renderer
	•	Root cause: React version mismatch (project at React 19.x, react-flow-renderer supports up to React 18)

Proposed Fix:
	1.	Downgrade React and ReactDOM to 18.2.0
	2.	Remove node_modules and package-lock.json
	3.	Reinstall dependencies fresh
	4.	Reinstall react-flow-renderer

⸻

Next Steps for Copilot

Once the current issue is fixed:
	1.	Verify AI call flow
	•	PromptInput → getAIResponse → ResultDisplay
	•	Test using designPrompt.json and sample workload
	2.	Parse AI output for diagrams
	•	Extract nodes/edges if AI provides structured JSON
	•	Render in DiagramView.jsx
	3.	Add user feedback states
	•	Loading indicator when AI call is in progress
	•	Error message when AI call fails
	4.	Connect other prompts
	•	optimizePrompt.json → optimization suggestions
	•	migratePrompt.json → migration plans

⸻

MVP Expansion Ideas
	•	Allow multiple workloads / prompts in a single session
	•	Save previous sessions to a lightweight local DB (e.g., IndexedDB)
	•	Include cost scenario toggling and comparison tables
	•	Add optional AI-assisted diagrams for site reliability / governance layers
	•	Enable exporting results to PDF or JSON

BACKLOG ITEMS
ID
Title
Description
Priority
B001
Gemini API Integration
Use Default Gemini API key from MakerSuite for MVP
High
B002
Prompt Templates
Ensure design, optimize, migrate prompts are structured & editable
High
B003
Result Parsing
Parse AI JSON for architecture nodes/edges
High
B004
Loading & Error States
Add loading spinner and error handling for AI calls
Medium
B005
MVP Expansion
Implement multi-session support, cost comparison, PDF export
Medium
B006
Multi-User Support
Add support for consultants / SMB teams
Low

Instructions for Copilot
	•	Read this file before making changes
	•	Always work incrementally, step by step, confirming each major task before proceeding
	•	Focus first on fixing the current dev server / React Flow issue
	•	After that, ensure AI integration is functional with structured prompts
	•	Expand MVP with backlog items in order of priority
