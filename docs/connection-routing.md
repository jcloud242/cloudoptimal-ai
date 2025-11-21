# Connection Routing Implementation

## Overview

The connection routing system creates clean, professional architecture diagram flows with vertical segments between horizontal layers, matching industry-standard cloud architecture diagrams (like Azure RAG examples).

## Visual Flow Pattern

```
Layer 1 (Presentation)
    [Node A] ────→ (horizontal)
                   ↓ (vertical curve)
                   → (horizontal) [Node B]
                                  Layer 2 (Application)
```

## Implementation Details

### Path Construction

Connections use **cubic Bezier curves** for smooth transitions between layers:

```javascript
const path = `
  M ${x1},${y1}                                    // Start at right edge of source
  L ${midX - 20},${y1}                             // Horizontal segment
  Q ${midX},${y1} ${midX},${y1 + offset}           // Curve down/up
  L ${midX},${y2 - offset}                         // Vertical segment
  Q ${midX},${y2} ${midX + 20},${y2}               // Curve to horizontal
  L ${x2},${y2}                                    // Final horizontal to target
`;
```

### Connection Types

1. **Solid Lines** (default)
   - Standard data flow
   - API calls
   - Database queries

2. **Dashed Lines** (`type: 'dashed'`)
   - Security monitoring
   - Logging connections
   - Administrative access

3. **Bidirectional** (`type: 'bidirectional'`)
   - Two-way data flow
   - Synchronization
   - Replication

### Key Features

- **Layer-aware**: Only connects nodes in different layers
- **Curved transitions**: Smooth quadratic bezier curves
- **Vertical flow**: Clean up/down routing between layers
- **Arrow markers**: Direction indicators with provider-specific colors
- **Label positioning**: Centered on connection path
- **Hover effects**: Visual feedback on node interaction

## Connection Filtering

The system filters connections to show only **inter-layer** connections:

```javascript
const mainFlowConnections = data.connections.filter(conn => {
  const fromNode = data.nodes.find(n => n.id === conn.from);
  const toNode = data.nodes.find(n => n.id === conn.to);
  return fromNode && toNode && fromNode.layer !== toNode.layer;
});
```

**Rationale**: Reduces visual clutter by hiding internal layer connections while highlighting the main data flow between architectural tiers.

## Path Calculation

### Horizontal Segments
- Exit from right edge of source node: `x = nodeX + 65`
- Enter left edge of target node: `x = nodeX - 65`

### Vertical Segments
- Calculated at midpoint: `midX = (x1 + x2) / 2`
- Direction determined by Y position comparison

### Curve Radius
- Entry curve: 20px offset from midpoint
- Exit curve: 20px offset to target
- Creates smooth, professional appearance

## Provider Theme Integration

Connection colors match provider themes:

```javascript
const providerThemes = {
  aws: { accent: '#FF9900' },      // AWS Orange
  azure: { accent: '#0078D4' },    // Azure Blue
  gcp: { accent: '#4285F4' },      // GCP Blue
  'multi-cloud': { accent: '#6B7280' }  // Neutral Gray
};
```

## Arrow Markers

Two marker definitions for directional flow:

**Forward Arrow:**
```svg
<marker id="arrow-{provider}">
  <path d="M0,0 L0,6 L9,3 z" fill="{accent}" />
</marker>
```

**Reverse Arrow** (for bidirectional):
```svg
<marker id="arrow-reverse-{provider}">
  <path d="M9,0 L9,6 L0,3 z" fill="{accent}" />
</marker>
```

## Connection Data Structure

```javascript
{
  from: "node-id-source",
  to: "node-id-target",
  label: "HTTPS",              // Optional connection label
  type: "solid|dashed|bidirectional"  // Optional connection type
}
```

## Best Practices

### For AI-Generated Diagrams

1. **Connect different layers**: Ensure connections span layers (e.g., presentation → application)
2. **Use meaningful labels**: "HTTPS", "SQL", "API", "Queue"
3. **Apply appropriate types**: Dashed for monitoring, bidirectional for sync
4. **Avoid over-connection**: Focus on primary data flow paths

### For Manual Diagrams

1. **Limit connections per node**: 2-4 connections typically optimal
2. **Group related nodes**: Minimize crossing paths
3. **Use consistent spacing**: Allows clean vertical routing
4. **Consider flow direction**: Left-to-right, then up/down

## Visual Comparison

### Before (Straight Lines)
```
[A] ────────────────→ [B]
    \
     \
      \────────────→ [C]
```
Problems:
- Diagonal clutter
- Overlapping paths
- Hard to follow flow

### After (Vertical Flow)
```
[A] ───→
        ↓
        → [B]
        
        ↓
        → [C]
```
Benefits:
- Clean, organized
- Easy to trace
- Professional appearance

## Performance Considerations

- **SVG Path Rendering**: Efficient for dozens of connections
- **Cubic Bezier**: Hardware-accelerated on modern browsers
- **Layer Filtering**: Reduces rendered connections by ~40-60%
- **Static Paths**: No animation overhead, smooth 60fps scrolling

## Troubleshooting

### Connections Not Appearing

**Issue**: No connections visible between nodes

**Check**:
1. Nodes are in different layers
2. Connection `from` and `to` IDs match node IDs
3. Node positions calculated (check `nodePositions` state)

### Overlapping Connections

**Issue**: Multiple connections overlap vertically

**Solution**:
- Adjust node spacing in layer configuration
- Stagger node Y positions
- Use connection labels to differentiate

### Curved Paths Look Broken

**Issue**: Sharp angles or discontinuous curves

**Check**:
1. Midpoint calculation: `midX = (x1 + x2) / 2`
2. Offset values (should be 20px)
3. Y position direction (up vs down)

## Future Enhancements

Potential improvements for connection routing:

1. **Collision Avoidance**: Route around nodes automatically
2. **Multi-path Bundling**: Group parallel connections
3. **Orthogonal Routing**: Pure horizontal/vertical segments (no diagonals)
4. **Connection Animation**: Animated flow indicators
5. **Interactive Routing**: Drag to reshape paths
6. **Connection Tooltips**: Show detailed flow information on hover
7. **Path Highlighting**: Highlight full path on node hover

## Related Documentation

- [Architecture Diagram Component](./architecture-diagram.md)
- [Icon Registry](./icon-registry.md)
- [Provider Themes](./provider-themes.md)
- [SVG Rendering Guide](./svg-rendering.md)

## References

- Azure Architecture Diagrams: Clean vertical flow pattern
- AWS Architecture Icons: Connection conventions
- GCP Cloud Architecture: Data flow visualization best practices
