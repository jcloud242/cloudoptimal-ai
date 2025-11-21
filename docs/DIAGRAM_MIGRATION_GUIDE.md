# Custom SVG Diagram System - Implementation Guide

## Overview
We've transitioned from Mermaid-based diagrams to a custom JSON-driven SVG diagram system for better control, reliability, and interactivity.

## What's Been Created

### 1. Schema Definition (`src/schemas/diagramSchema.js`)
- ✅ Defines DiagramNode, DiagramConnection, and ArchitectureDiagram types
- ✅ Includes validation functions
- ✅ Provides example diagram

### 2. Diagram Component (`src/components/ArchitectureDiagram.jsx`)
- ✅ Custom SVG rendering with layered layout
- ✅ Zoom and pan controls
- ✅ Interactive tooltips on hover
- ✅ Provider-specific theming (AWS, Azure, GCP)
- ✅ Automatic node positioning by layer

### 3. Updated Prompts (`src/prompts/designPrompt.js`)
- ✅ Changed architecture_diagram from Mermaid string to JSON object
- ✅ AI now generates structured data instead of code syntax

### 4. New DiagramView (`src/components/DiagramView_NEW.jsx`)
- ✅ Simplified component that renders ArchitectureDiagram
- ✅ Handles legacy Mermaid format with warning message

## What Needs To Be Integrated

### Step 1: Replace DiagramView.jsx
```bash
mv src/components/DiagramView.jsx src/components/DiagramView_OLD.jsx
mv src/components/DiagramView_NEW.jsx src/components/DiagramView.jsx
```

### Step 2: Update PromptPage.jsx

**Change state variable:**
```javascript
// OLD:
const [mermaidCode, setMermaidCode] = useState("");

// NEW:
const [diagramData, setDiagramData] = useState(null);
```

**Update all references:**
```javascript
// In handleSubmit, replace:
setMermaidCode("");
// With:
setDiagramData(null);

// In AI response parsing (lines ~76, ~127, ~194), replace:
setMermaidCode(parsedData.architecture_diagram);
// With:
setDiagramData(parsedData.architecture_diagram);

// In clear/reset handlers (line ~305), replace:
setMermaidCode("");
// With:
setDiagramData(null);

// In DiagramView component call (line ~322-327), replace:
<DiagramView
  nodes={nodes}
  edges={edges}
  mermaidCode={mermaidCode}
/>
// With:
<DiagramView diagramData={diagramData} />
```

### Step 3: Update multiProviderPrompt.js

Replace the architecture_diagram field with the same JSON structure used in designPrompt.js:

```javascript
"architecture_diagram": {
  "name": "Multi-cloud architecture name",
  "provider": "multi-cloud",
  "nodes": [
    {
      "id": "node-id",
      "label": "Short name",
      "layer": "presentation|application|data|security",
      "type": "service-type",
      "icon": "LucideIconName",
      "description": "Tooltip description",
      "cost": "$XX"
    }
  ],
  "connections": [
    {
      "from": "source-id",
      "to": "target-id",
      "label": "Connection type",
      "type": "solid|dashed"
    }
  ]
}
```

### Step 4: Remove Mermaid dependency (optional)
```bash
npm uninstall mermaid
```

## Benefits of New System

1. **No Syntax Errors**: AI generates structured JSON instead of code
2. **Better Labels**: No more truncation - tooltips show full details
3. **Interactive**: Hover tooltips, zoom/pan built-in
4. **Consistent**: Automatic layout engine ensures proper positioning
5. **Themeable**: Provider-specific colors (AWS orange, Azure blue, GCP multi-color)
6. **Maintainable**: Easy to extend with new features

## Testing

After integration, test by:
1. Generating a new architecture (Design page)
2. Verify diagram renders with proper layers
3. Test zoom/pan controls
4. Hover over nodes to see tooltips
5. Check that node count matches resource table

## Lucide Icons Available

Common icons for cloud components:
- `Globe` - CDN
- `Network` - Load Balancer
- `Server` - Compute/Web
- `Zap` - Serverless/Lambda
- `Database` - Databases
- `HardDrive` - Storage
- `Shield` - Security/IAM
- `Cpu` - Cache
- `Cloud` - General cloud service
- `Lock` - Encryption/Keys
- `FileText` - Logging
- `Route` - DNS/Routing

See full list: https://lucide.dev/icons/
