# React Flow Diagram System - Implementation Guide

## Overview

CloudOptimal AI uses **React Flow with ELK.js** for interactive, professional architecture diagrams. This replaced the previous Mermaid-based system for better control, reliability, and interactivity.

## Current Architecture (December 2025)

### Technology Stack

- **React Flow 11.11.4**: Interactive node-based diagram rendering
- **ELK.js 0.11.0**: Advanced graph layout algorithm (replaced Dagre in Dec 2025)
- **Lucide React**: Icon library for cloud service icons
- **Custom Icon Registry**: Provider-specific SVG icons (AWS, Azure, GCP)

### Key Components

1. **ArchitectureDiagram.jsx** - Main diagram renderer
   - React Flow integration with custom nodes
   - ELK.js async layout calculation
   - Multi-directional handle positions (top/bottom/left/right)
   - Theme-aware rendering (light/dark mode)
   - Intelligent utility node placement

2. **DiagramView.jsx** - Diagram container wrapper
   - Fullscreen capability
   - JSON source viewer
   - Responsive sizing

3. **Icon Registry** - Provider-specific icons
   - AWS, Azure, GCP service icons
   - Base64-encoded SVG storage
   - Fallback to Lucide icons

---

## ✅ What's Been Implemented

### 1. ELK.js Layout Engine (Dec 2025)

**Replaced Dagre with ELK for:**
- ✅ Active maintenance (vs abandoned Dagre)
- ✅ Superior edge routing algorithms
- ✅ Multi-directional handle support
- ✅ Intelligent utility node placement
- ✅ Orthogonal edge routing
- ✅ Better crossing minimization

**Configuration:**
```javascript
layoutOptions: {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.portConstraints': 'FREE',
  // ... more options
}
```

### 2. Multi-Directional Handles

Nodes support connections from all sides:
```javascript
handlePositions: {
  top: true,
  bottom: true,
  left: true,
  right: true,
}
```

Benefits:
- Cleaner edge routing
- Reduced crossing
- Professional appearance
- Optimal port selection

### 3. Smart Utility Node Placement

**Problem Solved:**
- Monitoring, logging, IAM nodes were positioned far from targets
- Edge crossings from long-distance connections

**Solution:**
- Utility nodes positioned ABOVE and CENTERED relative to targets
- Calculated based on average X position of connected nodes
- Positioned 160px above minimum Y of targets

**Example:**
```javascript
const avgX = targetPositions.reduce((sum, p) => sum + p.x, 0) / targetPositions.length;
const minTargetY = Math.min(...targetPositions.map(p => p.y));

return {
  x: avgX,              // Centered
  y: minTargetY - 160,  // Above
};
```

### 4. Theme Integration

Diagrams respect application theme:
```javascript
const { isDark } = useTheme();

<ReactFlow
  colorMode={isDark ? 'dark' : 'light'}
  // ... other props
/>
```

### 5. Async Layout Loading

```javascript
const [layoutComplete, setLayoutComplete] = React.useState(false);

React.useEffect(() => {
  const applyLayout = async () => {
    setLayoutComplete(false);
    const { nodes, edges } = await getLayoutedElements(initialNodes, initialEdges);
    setNodes(nodes);
    setEdges(edges);
    setLayoutComplete(true);
  };
  applyLayout();
}, [initialNodes, initialEdges]);
```

Shows loading state during calculation:
```javascript
{!layoutComplete && (
  <div>Generating diagram layout...</div>
)}
```

---

## JSON Structure

### Diagram Data Format

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
