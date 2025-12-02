# Architecture Diagram Layout Guide

## Professional Diagram Patterns

This guide explains how our ELK-based layout engine creates clean, professional architecture diagrams.

## Layout Strategy

### Main Flow (Solid Green Lines)
- **Horizontal left-to-right**: Client → Entry → Compute → Data
- Laid out automatically by ELK algorithm
- Represents actual data/traffic flow
- Type: `"solid"`
- Handles: Always `right` (source) → `left` (target)

### Utility Nodes (Dashed Purple Lines)
- **Intelligent positioning**: Checks for available space above/below targets
- **Edge avoidance**: Avoids crossing solid edges when possible
- **Dynamic handles**: Connection points determined by actual positions
- Type: `"dashed"`
- Handles: Calculated based on node positions (top/bottom for vertical, left/right for horizontal)

#### 1. DNS Nodes (Above Client)
**Examples**: Route 53 (AWS), Cloud DNS (GCP), Azure DNS (Azure)

**Positioning**: 
- Placed **ABOVE** the client node
- **NO connections** (DNS resolution happens before client call)
- Appears as infrastructure layer

**Example**:
```
              [Route 53]
                  
     [Client] → CDN → LB → Compute
```

**Connection Pattern**:
```json
{
  "id": "r53",
  "label": "Route 53",
  "layer": "networking",
  "type": "networking"
}
// NO connections in connections array
```
❌ **Don't**: Create connections from Route 53
✅ **Do**: Include Route 53 node with zero connections

---

#### 2. Security/WAF Nodes (Inline)
**Examples**: Cloud Armor, Firewall, WAF

**Positioning**: 
- Placed **BETWEEN** protected nodes at the **same Y-level** (inline with main flow)
- Only connects to **1 node** (not multiple)
- Appears in the middle of what it protects

**Example**:
```
Client → [Cloud Armor] → Load Balancer → Compute
```

**Connection Pattern**:
```json
{
  "from": "armor",
  "to": "lb",
  "label": "Protects",
  "type": "dashed"
}
```
❌ **Don't**: `armor → cdn` AND `armor → lb` (causes clutter)
✅ **Do**: `armor → lb` only

---

#### 3. IAM/Governance Nodes (Standalone)
**Examples**: Cloud IAM, Azure AD, Identity Management

**Positioning**:
- Top-right corner
- **NO connections** (governance is implied)
- Appears as oversight/governance layer

**Example**:
```
                                    [Cloud IAM]
                                        (no lines)

Client → CDN → LB → Compute → Database
```

**Connection Pattern**:
```json
// IAM node exists but has ZERO connections
{
  "id": "iam",
  "label": "Cloud IAM",
  "layer": "security",
  "type": "security"
}
// No connections in connections array
```

---

#### 4. Monitoring/Logging (Smart Positioning)
**Examples**: CloudWatch, Cloud Monitoring, Logging, CloudTrail

**Positioning**: 
- **Intelligently positioned** above OR below target based on available space
- Checks if position would cross solid edges
- Prefers above, but uses below if above would cause edge crossings
- Connection handles adapt automatically

**Example (Below)**:
```
Client → CDN → LB → ECS Fargate → Database
                         |
                         ↓ (dashed, from bottom)
                   [CloudWatch]
                   (connects from top)
```

**Example (Above)**:
```
                   [Monitoring]
                   (connects from bottom)
                         |
                         ↓ (dashed, to top)
Client → CDN → LB → Cloud Run → Database
```

**Connection Pattern**:
```json
{
  "from": "monitoring",
  "to": "ecs",
  "label": "Logs/Metrics",
  "type": "dashed"
}
// Handles auto-calculated:
// - If monitoring is below ECS: sourceHandle="top", targetHandle="bottom"
// - If monitoring is above ECS: sourceHandle="bottom", targetHandle="top"
```

---

#### 5. CI/CD (Above Deployment Target)
**Examples**: Cloud Build, GitHub Actions, Jenkins

**Positioning**:
- Positioned **above** deployment target
- Connects to **1 deployment endpoint** only

**Example**:
```
              [Cloud Build]
                    |
                    ↓ (dashed)
Client → LB → Cloud Run → Database
```

**Connection Pattern**:
```json
{
  "from": "build",
  "to": "cloudrun",  // Only the deployment target
  "label": "Deploy Container",
  "type": "dashed"
}
```

---

## Why These Patterns?

### Professional Architecture Standards
1. **Inline Security**: Industry standard to show security/WAF inline with flow
2. **Implied Governance**: IAM is assumed to control everything - explicit lines are redundant
3. **Representative Monitoring**: One connection implies oversight of entire flow
4. **Clean Visuals**: Reduces line crossings and visual clutter

### Technical Benefits
1. **Scalability**: Works with 5 nodes or 50 nodes
2. **Clarity**: Easy to follow main data flow
3. **Collision Avoidance**: Automatic spacing prevents overlaps
4. **Flexibility**: Users can still manually adjust if needed

---

## AI Prompt Guidelines

When generating architecture diagrams, the AI follows these rules:

```javascript
// SECURITY/WAF: Only 1 connection
{
  "from": "armor",
  "to": "lb",  // Not cdn AND lb
  "type": "dashed"
}

// IAM: ZERO connections (standalone)
// No connections array entries for IAM

// MONITORING: Only 1 representative connection
{
  "from": "monitoring",
  "to": "cloudrun",  // Not every service
  "type": "dashed"
}

// CI/CD: Only 1 deployment target
{
  "from": "build",
  "to": "cloudrun",
  "type": "dashed"
}
```

---

## Layout Algorithm Details

### Node Classification
```javascript
// Utility nodes identified by:
1. Security/Operations layer + no solid connections
2. OR: Only dashed outgoing connections
3. OR: No connections at all (standalone)
```

### Positioning Logic
```javascript
if (isStandalone) {
  // IAM: Top-right corner
  position = { x: maxX + 100, y: minY - 200 };
}
else if (isSecurityInline && targets === 2) {
  // Cloud Armor: Between protected nodes, same Y
  position = { x: avgX, y: avgY };
}
else if (hasTargets) {
  // Monitoring/Build: Above targets, centered
  position = { x: avgX, y: minY - 200 };
}
```

### Collision Detection
- 220px minimum horizontal spacing
- Automatic right-shift if overlap detected
- Up to 20 adjustment attempts

---

## Examples

### ✅ Clean Gaming Architecture
```
                [Cloud Armor]
                      |
                      ↓
Client → CDN → Global LB → Cloud Run → Firestore
                              ↑              ↑
                              |              |
                      [Cloud Build]    [Monitoring]
                                           (top-right)
                                          [Cloud IAM]
```

### ❌ Messy (Old Approach)
```
[Armor] ----+---> CDN
            |
            +---> LB
                   ↓
[Monitor]---+---> Cloud Run
            |
            +---> Firestore
            |
            +---> Redis

[IAM] ------+---> Cloud Run
            |
            +---> Firestore
            |
            +---> Redis
```
Lines everywhere, overlapping nodes, impossible to read.

---

## Implementation Files

- **Layout Engine**: `src/components/ArchitectureDiagram.jsx`
- **AI Instructions**: `src/prompts/designPrompt.js`
- **Migration Guide**: `docs/ELK_MIGRATION_GUIDE.md`

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Related**: ELK Migration, Connection Guidelines
