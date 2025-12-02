# ELK.js Migration Guide - From Dagre to ELK

## Executive Summary

**Migration Date**: December 1, 2025  
**Status**: ✅ Complete  
**Impact**: Major improvement in diagram layout quality and maintainability

We successfully migrated from the abandoned Dagre layout library to the actively maintained ELK.js (Eclipse Layout Kernel), resulting in superior diagram layouts, better edge routing, and intelligent utility node placement.

---

## Why We Migrated

### Problems with Dagre

1. **Abandoned Project**: Last updated 2017, no active maintenance
2. **Limited Edge Routing**: Only basic left-right connections
3. **Poor Utility Placement**: Monitoring/logging nodes placed far from targets
4. **Edge Crossings**: Frequent visual clutter from overlapping connections
5. **No Multi-Handle Support**: Only left/right handles, causing awkward routing

### Benefits of ELK.js

1. ✅ **Active Development**: Regular updates and community support
2. ✅ **Superior Algorithms**: Multiple layout algorithms (layered, force, box, etc.)
3. ✅ **Orthogonal Routing**: Professional-looking right-angle connections
4. ✅ **Port Constraints**: Free port positioning for optimal edge routing
5. ✅ **Better Performance**: Optimized for large graphs
6. ✅ **Extensive Options**: Highly customizable layout parameters

---

## Technical Changes

### Package Changes

**Before:**
```json
{
  "dependencies": {
    "dagre": "^0.8.5"
  },
  "devDependencies": {
    "@types/dagre": "^0.7.53"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "elkjs": "^0.11.0"
  }
}
```

**Installation:**
```bash
npm install elkjs
npm uninstall dagre @types/dagre
```

---

## Architecture Changes

### 1. Multi-Directional Handles

**Before (Dagre):**
```javascript
// Nodes only had left/right handles
sourcePosition: Position.Right,
targetPosition: Position.Left,
```

**After (ELK):**
```javascript
// Nodes have handles on all 4 sides
handlePositions: {
  top: true,
  bottom: true,
  left: true,
  right: true,
}
```

**CustomNode Component:**
```javascript
<Handle type="target" position={Position.Top} id="top" />
<Handle type="source" position={Position.Bottom} id="bottom" />
<Handle type="target" position={Position.Left} id="left" />
<Handle type="source" position={Position.Right} id="right" />
```

### 2. Async Layout Calculation

**Before (Dagre - Synchronous):**
```javascript
const getLayoutedElements = (nodes, edges) => {
  dagre.layout(dagreGraph);
  return { nodes: layoutedNodes, edges };
};

const { nodes, edges } = useMemo(() => 
  getLayoutedElements(initialNodes, initialEdges),
  [initialNodes, initialEdges]
);
```

**After (ELK - Asynchronous):**
```javascript
const getLayoutedElements = async (nodes, edges) => {
  const layoutedGraph = await elk.layout(graph);
  return { nodes: layoutedNodes, edges };
};

React.useEffect(() => {
  const applyLayout = async () => {
    const { nodes, edges } = await getLayoutedElements(initialNodes, initialEdges);
    setNodes(nodes);
    setEdges(edges);
  };
  applyLayout();
}, [initialNodes, initialEdges]);
```

### 3. Graph Configuration

**Dagre Configuration:**
```javascript
dagreGraph.setGraph({ 
  rankdir: 'LR',
  nodesep: 60,
  ranksep: 180,
  edgesep: 20,
  align: 'UL',
  ranker: 'tight-tree',
});
```

**ELK Configuration:**
```javascript
const graph = {
  id: 'root',
  layoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '80',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.cycleBreaking.strategy': 'GREEDY',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.portConstraints': 'FREE',
  },
  children: elkNodes,
  edges: elkEdges,
};
```

**Key Differences:**
- `algorithm`: Specifies layout type (layered, force, box, etc.)
- `edgeRouting`: ORTHOGONAL creates professional right-angle connections
- `portConstraints`: FREE allows ELK to choose optimal handle positions
- `crossingMinimization`: Reduces edge overlaps
- More granular control over spacing and placement

---

## Intelligent Utility Node Placement

### The Problem

In Dagre, utility nodes (monitoring, logging, IAM, security) were positioned using simple rules:
- All utilities placed in a row above the main flow
- No consideration of what they connect to
- Result: IAM node might be across the diagram from the client it authenticates

### The Solution with ELK

**Smart Positioning Algorithm:**

1. **Classify Nodes:**
   ```javascript
   const utilityNodes = nodes.filter(n => 
     dashedTargets[n.id] && dashedTargets[n.id].length > 0 && 
     !outgoingCount[n.id] && !incomingCount[n.id]
   );
   ```

2. **Calculate Target Positions:**
   ```javascript
   const targets = dashedTargets[node.id] || [];
   const targetPositions = targets
     .map(t => positionedNodesMap[t])
     .filter(Boolean);
   ```

3. **Center Above Targets:**
   ```javascript
   const avgX = targetPositions.reduce((sum, p) => sum + p.x, 0) / targetPositions.length;
   const minTargetY = Math.min(...targetPositions.map(p => p.y));
   
   return {
     x: avgX,              // Centered horizontally
     y: minTargetY - 160,  // Positioned above
   };
   ```

**Example:**
- Mobile Client at position (100, 300)
- Cloud Run at position (500, 300)
- IAM connects to both
- **Result**: IAM positioned at ((100+500)/2, 140) = (300, 140)
- **Benefit**: IAM centered above both targets instead of far away

---

## Edge Routing Improvements

### Dagre Limitations
- Only straight or simple curved lines
- Limited control over routing
- Frequent edge crossings
- No awareness of node placement

### ELK Advantages
- **Orthogonal Routing**: Clean right-angle connections
- **Port Optimization**: Chooses best handle positions automatically
- **Crossing Minimization**: Built-in algorithm to reduce overlaps
- **Layer-Aware**: Respects architectural layers

**Visual Comparison:**

```
BEFORE (Dagre):
[Client] ───────────────────────────→ [IAM]
           \                             ↗
            \                          /
             → [LB] → [Cloud Run] ────

AFTER (ELK):
         [IAM]
           ↓
[Client] → [LB] → [Cloud Run]
```

---

## React Flow Theme Integration

**Added Theme Support:**

```javascript
import { useTheme } from '../contexts/ThemeContext';

export default function ArchitectureDiagram({ data }) {
  const { isDark } = useTheme();
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      colorMode={isDark ? 'dark' : 'light'}
      // ... other props
    >
```

**Benefits:**
- Diagram matches application theme automatically
- No manual color overrides needed
- Consistent UX across all components
- Leverages React Flow's built-in theme system

---

## AI Prompt Updates

### Updated Connection Guidelines

**Before:**
```javascript
"IMPORTANT_CONNECTION_GUIDELINES": "Show PRIMARY data flow connections clearly. Each node should have max 3-4 outgoing connections for clarity. Use dashed lines for monitoring, security, and supporting services."
```

**After:**
```javascript
"IMPORTANT_CONNECTION_GUIDELINES": "Show PRIMARY data flow connections clearly using solid green lines (type: 'solid'). Use dashed purple lines (type: 'dashed') for monitoring, security, logging, and supporting services. CRITICAL PLACEMENT: Utility nodes (monitoring, logging, IAM, security) should connect to nodes they observe/protect, and the diagram layout will intelligently position them NEAR their targets (not across the diagram). Each main flow node should have max 3-4 connections for clarity."
```

**Key Changes:**
- Explains color coding (green solid, purple dashed)
- Informs AI that utility placement is automatic
- Emphasizes proximity of utilities to targets
- Reduces confusion about node positioning

---

## Performance Considerations

### Async Layout
- ELK layout is asynchronous (uses Web Workers internally)
- Added loading state during calculation:
  ```javascript
  {!layoutComplete && (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-gray-400">Generating diagram layout...</div>
    </div>
  )}
  ```

### Optimization
- Layout only recalculates when nodes/edges change
- React Flow handles rendering optimization
- ELK efficiently handles graphs with 50+ nodes
- No performance impact for typical diagrams (10-20 nodes)

---

## Testing Results

### Before Migration (Dagre)
- ❌ IAM node positioned far from client
- ❌ Monitoring nodes scattered
- ❌ Edge crossings common
- ❌ Only horizontal flow
- ❌ Library abandoned

### After Migration (ELK)
- ✅ Utilities centered above targets
- ✅ Monitoring near observed services
- ✅ Minimal edge crossings
- ✅ Professional orthogonal routing
- ✅ Active development & support

---

## Migration Checklist

- [x] Install ELK.js package
- [x] Remove Dagre dependencies
- [x] Update CustomNode with 4-directional handles
- [x] Convert layout function to async
- [x] Update React component to handle async layout
- [x] Add loading state during layout calculation
- [x] Implement utility node smart positioning
- [x] Configure ELK layout options
- [x] Integrate theme support
- [x] Update AI prompts
- [x] Test with various diagram sizes
- [x] Verify session loading works
- [x] Update documentation

---

## Rollback Plan (If Needed)

**To revert to Dagre:**

1. Reinstall Dagre:
   ```bash
   npm install dagre @types/dagre
   npm uninstall elkjs
   ```

2. Restore previous ArchitectureDiagram.jsx from git:
   ```bash
   git checkout HEAD~5 -- src/components/ArchitectureDiagram.jsx
   ```

3. Revert prompt changes:
   ```bash
   git checkout HEAD~5 -- src/prompts/designPrompt.js
   ```

**Note:** Rollback not recommended - ELK.js provides significant improvements.

---

## Future Enhancements

Potential improvements enabled by ELK.js:

1. **Multiple Layout Algorithms**
   - Switch between layered, force-directed, and box layouts
   - Let users choose preferred visualization style

2. **Advanced Edge Routing**
   - Experiment with spline routing for organic look
   - Polyline routing for strict orthogonal edges

3. **Hierarchical Layouts**
   - Use ELK's box algorithm for nested architectures
   - Support for VPC/subnet grouping

4. **Port Side Constraints**
   - Force specific edges to use specific handles
   - Create more predictable routing patterns

5. **Interactive Layout**
   - Allow users to adjust spacing parameters
   - Real-time layout updates

---

## References

- [ELK.js Documentation](https://eclipse.dev/elk/)
- [ELK Layout Options](https://www.eclipse.org/elk/reference/options.html)
- [React Flow Documentation](https://reactflow.dev/)
- [Dagre GitHub (Archived)](https://github.com/dagrejs/dagre)

---

## Support

For questions or issues related to the ELK migration:

1. Check the [ELK.js documentation](https://eclipse.dev/elk/)
2. Review this migration guide
3. Check `/docs/connection-routing.md` for edge routing details
4. Review `/src/components/ArchitectureDiagram.jsx` for implementation

---

**Migration completed successfully on December 1, 2025**  
**Impact**: Significant improvement in diagram quality and user experience
