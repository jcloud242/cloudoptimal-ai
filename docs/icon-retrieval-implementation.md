# Icon Retrieval Implementation Guide

## Overview

This document provides a technical deep-dive into the icon retrieval system, explaining how icons are looked up, matched, and rendered in architecture diagrams. It covers the complete flow from AI-generated diagram data to visual icon display.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Icon Retrieval Flow](#icon-retrieval-flow)
3. [Service Name Normalization](#service-name-normalization)
4. [Variation Matching Algorithm](#variation-matching-algorithm)
5. [Fallback Generation](#fallback-generation)
6. [Component Integration](#component-integration)
7. [Performance Optimization](#performance-optimization)
8. [Code Examples](#code-examples)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Response Layer                        │
│  - Generates architecture_diagram JSON                       │
│  - Includes node.service field (e.g., "s3", "lambda")       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  ArchitectureDiagram Component               │
│  - Receives diagram data with nodes and connections          │
│  - Calls getNodeIcon(node) for each node                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Icon Retrieval Layer                      │
│  - getNodeIcon(node) function                                │
│  - Checks node.service field                                 │
│  - Calls iconRegistry.getIcon(provider, service)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Icon Registry                           │
│  - Normalizes service name                                   │
│  - Generates service variations                              │
│  - Searches icon map                                         │
│  - Returns icon data or generates fallback                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rendering Layer                           │
│  - Receives { type: 'provider', data } or { type: 'lucide' } │
│  - Renders <image> for provider icons                        │
│  - Renders <foreignObject> for Lucide icons                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Structures

**Diagram Node:**
```javascript
{
  id: "storage-1",
  label: "S3 Bucket",
  layer: "data",
  type: "storage",
  service: "s3",           // ← Icon lookup key
  icon: "HardDrive",       // ← Fallback icon
  description: "Primary data storage",
  cost: "$23"
}
```

**Icon Registry Entry:**
```javascript
{
  svg: "data:image/svg+xml;base64,PHN2Zy4uLg==",
  metadata: {
    name: "Amazon S3",
    description: "Object storage service",
    category: "storage",
    provider: "aws",
    service: "s3",
    tags: ["storage", "object", "bucket"],
    version: "1.0.0"
  }
}
```

**Icon Result:**
```javascript
// Provider icon found
{
  type: 'provider',
  data: {
    svg: "data:image/svg+xml;base64,...",
    metadata: { ... }
  }
}

// Lucide fallback
{
  type: 'lucide',
  Icon: HardDriveIcon  // React component
}
```

---

## Icon Retrieval Flow

### Complete Retrieval Pipeline

```
START: Diagram node needs icon
│
├─ Step 1: Extract node.service and diagram.provider
│   │
│   ├─ Has node.service? ──No──┐
│   │                           │
│   └─ Yes                      │
│      │                        │
│      ▼                        │
├─ Step 2: Call iconRegistry.getIcon(provider, service)
│   │                           │
│   ├─ Normalize service name   │
│   │   "Amazon S3" → "s3"      │
│   │                           │
│   ├─ Generate variations      │
│   │   ["s3", "S3", "amazon-s3", "amazons3"]
│   │                           │
│   ├─ Search icon map          │
│   │   icons[provider][variation]
│   │                           │
│   ├─ Icon found? ──Yes──┐     │
│   │                      │     │
│   └─ No                 │     │
│      │                  │     │
│      ▼                  │     │
├─ Step 3: Generate fallback icon
│   │   - Get provider color    │
│   │   - Extract initials      │
│   │   - Create SVG            │
│   │   - Return icon data      │
│   │                           │
│   └──────────────────────┐    │
│                          │    │
│   ◄──────────────────────┘    │
│   Provider icon ready         │
│                               │
│   ◄───────────────────────────┘
│   No service field - use Lucide
│                               
├─ Step 4: Return to component
│   │
│   ├─ Provider icon → { type: 'provider', data }
│   └─ Lucide icon   → { type: 'lucide', Icon }
│
├─ Step 5: Render based on type
│   │
│   ├─ type === 'provider'
│   │   └─ <image href={data.svg} />
│   │
│   └─ type === 'lucide'
│       └─ <foreignObject><Icon /></foreignObject>
│
END: Icon displayed in diagram
```

### Code Flow Example

```javascript
// 1. Component receives node data
const node = {
  id: "api-1",
  service: "API Gateway",  // User-friendly name
  icon: "Network",
  layer: "presentation"
};

// 2. getNodeIcon called
const iconInfo = getNodeIcon(node);

// 3. Inside getNodeIcon:
if (node.service && data.provider) {
  // Try provider icon
  const iconData = iconRegistry.getIcon('aws', 'API Gateway');
  
  // 4. Inside iconRegistry.getIcon:
  const normalized = normalizeServiceName('API Gateway');
  // → "apigateway"
  
  const variations = generateServiceVariations('apigateway');
  // → ["apigateway", "api-gateway", "gateway", "api"]
  
  // Try each variation
  for (const variant of variations) {
    const icon = icons['aws'][variant];
    if (icon) return icon;
  }
  
  // Not found - generate fallback
  return getFallbackIcon('aws', 'API Gateway');
  // → SVG with "AG" text on AWS orange background
}

// 5. Return to component
return { type: 'provider', data: iconData };

// 6. Component renders
{iconInfo.type === 'provider' && (
  <image href={iconInfo.data.svg} width={32} height={32} />
)}
```

---

## Service Name Normalization

### Purpose

Service names come in many formats from AI responses:
- "Amazon S3"
- "AWS Lambda"
- "Azure Functions"
- "Cloud-Storage"
- "API Gateway"

Normalization ensures consistent lookup regardless of format.

### Normalization Algorithm

```javascript
normalizeServiceName(service) {
  if (!service) return '';
  
  return service
    .toLowerCase()                    // "Amazon S3" → "amazon s3"
    .replace(/[^a-z0-9-]/g, '')      // "amazon s3" → "amazons3"
    .trim();                          // Remove whitespace
}
```

### Examples

| Input | Normalized Output |
|-------|------------------|
| `"Amazon S3"` | `"amazons3"` |
| `"AWS Lambda"` | `"awslambda"` |
| `"Cloud Storage"` | `"cloudstorage"` |
| `"API-Gateway"` | `"apigateway"` |
| `"Azure VM"` | `"azurevm"` |
| `"EC2 Instance"` | `"ec2instance"` |

### Edge Cases Handled

```javascript
normalizeServiceName("  Amazon  S3  ")     // "amazons3"
normalizeServiceName("API_Gateway")        // "apigateway"
normalizeServiceName("Cloud-Functions!")   // "cloudfunctions"
normalizeServiceName("Azure/VM")           // "azurevm"
normalizeServiceName("")                   // ""
normalizeServiceName(null)                 // ""
```

---

## Variation Matching Algorithm

### Why Variations?

Icon registry keys might be stored as:
- `"s3"` (short form)
- `"lambda"` (service name)
- `"apigateway"` (concatenated)

AI might provide:
- `"Amazon S3"` (full name)
- `"AWS Lambda"` (prefixed)
- `"API Gateway"` (spaced)

Variations bridge this gap.

### Variation Generation Logic

```javascript
generateServiceVariations(service) {
  if (!service) return [];
  
  const normalized = this.normalizeServiceName(service);
  const variations = new Set([normalized]);
  
  // Add camelCase → kebab-case
  if (normalized.includes('-')) {
    variations.add(normalized.replace(/-/g, ''));
  } else if (normalized.length > 3) {
    // Convert camelCase to kebab-case
    const kebab = normalized.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    variations.add(kebab);
  }
  
  // Add without common prefixes
  const withoutPrefix = normalized
    .replace(/^aws/, '')
    .replace(/^azure/, '')
    .replace(/^gcp/, '')
    .replace(/^google/, '')
    .replace(/^amazon/, '')
    .replace(/^cloud/, '');
  
  if (withoutPrefix && withoutPrefix !== normalized) {
    variations.add(withoutPrefix);
  }
  
  // Add split variations (for compound names)
  if (normalized.length > 6) {
    const parts = normalized.split(/(?=[A-Z])/);
    if (parts.length > 1) {
      variations.add(parts[parts.length - 1].toLowerCase());
    }
  }
  
  return Array.from(variations);
}
```

### Variation Examples

**Example 1: "apigateway"**
```javascript
generateServiceVariations("apigateway")
// Returns:
[
  "apigateway",      // Original
  "api-gateway",     // Kebab case
  "gateway"          // Last component
]
```

**Example 2: "cloudstorage"**
```javascript
generateServiceVariations("cloudstorage")
// Returns:
[
  "cloudstorage",    // Original
  "cloud-storage",   // Kebab case
  "storage"          // Without prefix
]
```

**Example 3: "awslambda"**
```javascript
generateServiceVariations("awslambda")
// Returns:
[
  "awslambda",       // Original
  "aws-lambda",      // Kebab case
  "lambda"           // Without AWS prefix
]
```

### Lookup with Variations

```javascript
getIcon(provider, service) {
  const variations = this.generateServiceVariations(service);
  
  // Try each variation until match found
  for (const variant of variations) {
    const icon = this.icons[provider]?.[variant];
    if (icon) {
      return icon;  // Return first match
    }
  }
  
  // No match found - generate fallback
  return this.getFallbackIcon(provider, service);
}
```

### Matching Priority

The algorithm tries variations in order:
1. **Exact normalized match**: `"s3"` → `"s3"`
2. **Kebab-case variant**: `"apigateway"` → `"api-gateway"`
3. **Without prefix**: `"awslambda"` → `"lambda"`
4. **Component extraction**: `"cloudstorage"` → `"storage"`

This ensures flexible matching while preferring exact matches.

---

## Fallback Generation

### When Fallbacks Are Used

Fallback icons are generated when:
1. Service name not found in icon registry
2. Icon registry not loaded
3. Typo in service name
4. New service not yet added to registry

### Fallback Icon Design

**Visual Appearance:**
- Rounded square (32x32px, 8px border radius)
- Provider-specific background color
- White text displaying service initials
- Professional, consistent styling

**Provider Colors:**
```javascript
const PROVIDER_COLORS = {
  aws: '#FF9900',      // AWS Orange
  azure: '#0078D4',    // Azure Blue
  gcp: '#4285F4',      // GCP Blue
  default: '#6B7280'   // Gray
};
```

### Fallback Generation Algorithm

```javascript
getFallbackIcon(provider, service) {
  const color = PROVIDER_COLORS[provider] || PROVIDER_COLORS.default;
  const initials = this.getServiceInitials(service);
  
  // Generate SVG with provider color and initials
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill="${color}"/>
      <text 
        x="16" 
        y="20" 
        font-family="Arial, sans-serif" 
        font-size="14" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle">
        ${initials}
      </text>
    </svg>
  `;
  
  const base64 = btoa(svg);
  
  return {
    svg: `data:image/svg+xml;base64,${base64}`,
    metadata: {
      name: service,
      description: 'Generated fallback icon',
      category: 'fallback',
      provider: provider,
      service: this.normalizeServiceName(service),
      tags: ['fallback', 'generated'],
      version: '1.0.0'
    }
  };
}
```

### Initial Extraction Logic

```javascript
getServiceInitials(service) {
  if (!service) return '??';
  
  // Remove common prefixes
  const cleaned = service
    .replace(/^(aws|azure|gcp|google|amazon|cloud)\s*/i, '')
    .trim();
  
  // Split into words
  const words = cleaned.split(/[\s-_]+/);
  
  if (words.length >= 2) {
    // Multi-word: first letter of first 2 words
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (cleaned.length >= 2) {
    // Single word: first 2 letters
    return cleaned.substring(0, 2).toUpperCase();
  }
  
  return cleaned.substring(0, 2).toUpperCase() || '??';
}
```

### Initial Examples

| Service Name | Extracted Initials |
|-------------|-------------------|
| `"API Gateway"` | `"AG"` |
| `"Lambda"` | `"LA"` |
| `"Cloud Storage"` | `"CS"` |
| `"AWS S3"` | `"S3"` |
| `"Virtual Machines"` | `"VM"` |
| `"Compute Engine"` | `"CE"` |
| `"Unknown Service"` | `"US"` |

### Fallback Icon Examples

**AWS Lambda (not in registry):**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#FF9900"/>
  <text x="16" y="20" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="white" 
        text-anchor="middle">LA</text>
</svg>
```

**Azure Cosmos DB:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0078D4"/>
  <text x="16" y="20" font-family="Arial, sans-serif" 
        font-size="14" font-weight="bold" fill="white" 
        text-anchor="middle">CO</text>
</svg>
```

---

## Component Integration

### ArchitectureDiagram Integration

**1. Import Icon Registry:**
```javascript
import iconRegistry from '../icons';
```

**2. Define Icon Lookup Function:**
```javascript
const getNodeIcon = (node) => {
  // Try provider-specific icon first
  if (node.service && data.provider) {
    const iconData = iconRegistry.getIcon(data.provider, node.service);
    if (iconData) {
      return { type: 'provider', data: iconData };
    }
  }

  // Fallback to Lucide icon
  const Icon = LucideIcons[node.icon] || LucideIcons.Box;
  return { type: 'lucide', Icon };
};
```

**3. Use in Node Rendering:**
```javascript
{data.nodes.map(node => {
  const pos = nodePositions[node.id];
  const iconInfo = getNodeIcon(node);
  
  return (
    <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
      {/* Node background */}
      <rect x={-60} y={-35} width={120} height={70} ... />
      
      {/* Conditional icon rendering */}
      {iconInfo.type === 'provider' ? (
        <image
          x={-16} y={-28}
          width={32} height={32}
          href={iconInfo.data.svg}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <foreignObject x={-14} y={-25} width={28} height={28}>
          <div className="flex items-center justify-center">
            <iconInfo.Icon className="w-7 h-7" />
          </div>
        </foreignObject>
      )}
      
      {/* Node label */}
      <text x={0} y={15} ...>{node.label}</text>
    </g>
  );
})}
```

### AI Prompt Integration

**Updated Node Schema:**
```javascript
{
  "id": "storage-1",
  "label": "S3 Bucket",
  "layer": "data",
  "type": "storage",
  "service": "s3",        // ← NEW: Provider-specific service name
  "icon": "HardDrive",    // ← Fallback for Lucide
  "description": "Primary data storage",
  "cost": "$23"
}
```

**AI Prompt Instructions:**
```
"service": "Provider-specific service name for icon lookup (e.g., 
'cloudfront', 's3', 'lambda', 'ec2', 'rds', 'dynamodb', 'blob', 
'functions', 'virtualmachines', 'cloudstorage', 'computeengine', 
'cloudfunctions'). Use lowercase, no spaces. This enables automatic 
provider-specific icon display."
```

### Rendering Types

**Provider Icon (SVG Image):**
```jsx
<image
  x={-16}                        // Center horizontally
  y={-28}                        // Position above center
  width={32}                     // Standard icon size
  height={32}                    
  href={iconInfo.data.svg}       // Base64 SVG data
  preserveAspectRatio="xMidYMid meet"  // Maintain aspect ratio
/>
```

**Lucide Icon (React Component):**
```jsx
<foreignObject x={-14} y={-25} width={28} height={28}>
  <div className="flex items-center justify-center">
    <iconInfo.Icon 
      className="w-7 h-7" 
      style={{ color: theme.primary }} 
    />
  </div>
</foreignObject>
```

---

## Performance Optimization

### Registry Initialization

**Singleton Pattern:**
```javascript
// src/icons/index.js
import { IconRegistry } from './iconRegistry.js';
import { awsIcons } from './aws.js';
import { azureIcons } from './azure.js';
import { gcpIcons } from './gcp.js';

// Create single instance
const iconRegistry = new IconRegistry();

// Load icons once on module import
iconRegistry.loadIconsFromObject('aws', awsIcons);
iconRegistry.loadIconsFromObject('azure', azureIcons);
iconRegistry.loadIconsFromObject('gcp', gcpIcons);

// Export singleton
export default iconRegistry;
```

**Benefits:**
- Icons loaded once at application start
- No repeated initialization
- Shared across all components
- Minimal memory footprint

### Lookup Optimization

**Icon Map Structure:**
```javascript
this.icons = {
  aws: {
    s3: { svg: "...", metadata: {...} },
    lambda: { svg: "...", metadata: {...} },
    ec2: { svg: "...", metadata: {...} }
  },
  azure: {
    blob: { svg: "...", metadata: {...} },
    functions: { svg: "...", metadata: {...} }
  },
  gcp: {
    cloudstorage: { svg: "...", metadata: {...} }
  }
};
```

**O(1) Access:**
```javascript
// Direct property lookup - very fast
const icon = this.icons[provider][serviceVariation];
```

**Variation Loop:**
```javascript
// Typically 3-5 iterations max
for (const variant of variations) {
  const icon = this.icons[provider]?.[variant];
  if (icon) return icon;  // Early return on first match
}
```

### Memory Footprint

**Icon Size Estimates:**
```
Single base64 SVG icon:    ~2-5 KB
21 icons (7 per provider): ~50-100 KB
100 icons:                 ~250-500 KB
```

**Optimization Strategies:**

1. **SVG Minification:**
```bash
npx svgo input.svg -o output.svg --multipass
```

2. **Selective Loading:**
```javascript
// Load only needed provider
import { awsIcons } from './aws.js';
iconRegistry.loadIconsFromObject('aws', awsIcons);
```

3. **Lazy Loading:**
```javascript
// Load on demand
async function loadAzureIcons() {
  const { azureIcons } = await import('./azure.js');
  iconRegistry.loadIconsFromObject('azure', azureIcons);
}
```

### Rendering Performance

**SVG vs Lucide:**

| Metric | SVG <image> | Lucide <foreignObject> |
|--------|------------|------------------------|
| DOM Nodes | 1 | 3+ |
| Re-renders | No (static) | Yes (React) |
| Memory | Lower | Higher |
| Styling | Limited | Full CSS |

**Best Practices:**
- Use provider SVG icons for static services
- Reserve Lucide for dynamic/interactive elements
- Batch icon lookups before rendering
- Memoize icon results if needed

---

## Code Examples

### Example 1: Basic Icon Lookup

```javascript
import iconRegistry from '../icons';

// Simple lookup
const s3Icon = iconRegistry.getIcon('aws', 's3');
console.log(s3Icon.metadata.name);  // "Amazon S3"

// Flexible service name
const lambdaIcon = iconRegistry.getIcon('aws', 'AWS Lambda');
console.log(lambdaIcon.metadata.service);  // "lambda"

// Auto-fallback
const unknownIcon = iconRegistry.getIcon('aws', 'Unknown Service');
console.log(unknownIcon.metadata.category);  // "fallback"
```

### Example 2: Check Icon Availability

```javascript
// Before using icon, check if it exists
function renderServiceIcon(provider, service) {
  if (iconRegistry.hasIcon(provider, service)) {
    const icon = iconRegistry.getIcon(provider, service);
    return <img src={icon.svg} alt={icon.metadata.name} />;
  } else {
    // Use fallback or show warning
    console.warn(`Icon not found: ${provider}/${service}`);
    return <DefaultIcon />;
  }
}
```

### Example 3: Search and Display

```javascript
function ServiceIconBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (query) => {
    setSearchTerm(query);
    const icons = iconRegistry.searchIcons(query);
    setResults(icons);
  };
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search icons..."
      />
      <div className="icon-grid">
        {results.map(({ provider, service, icon }) => (
          <div key={`${provider}-${service}`}>
            <img src={icon.svg} alt={icon.metadata.name} />
            <p>{icon.metadata.name}</p>
            <span>{provider.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 4: Dynamic Icon Registration

```javascript
// Add custom icon at runtime
function addCustomIcon(provider, service, svgContent) {
  const base64 = btoa(svgContent);
  
  iconRegistry.registerIcon(provider, service, {
    svg: `data:image/svg+xml;base64,${base64}`,
    metadata: {
      name: service,
      description: 'Custom user icon',
      category: 'custom',
      provider: provider,
      service: service,
      tags: ['custom'],
      version: '1.0.0'
    }
  });
  
  console.log(`Registered ${provider}/${service}`);
}

// Usage
const customSvg = `<svg>...</svg>`;
addCustomIcon('aws', 'custom-service', customSvg);
```

### Example 5: Provider Statistics Dashboard

```javascript
function IconStatsDashboard() {
  const stats = iconRegistry.getProviderStats();
  
  return (
    <div className="stats-dashboard">
      <h2>Icon Registry Statistics</h2>
      <div className="stat-cards">
        <StatCard title="AWS Icons" count={stats.aws} color="#FF9900" />
        <StatCard title="Azure Icons" count={stats.azure} color="#0078D4" />
        <StatCard title="GCP Icons" count={stats.gcp} color="#4285F4" />
        <StatCard title="Total Icons" count={stats.total} color="#6B7280" />
      </div>
    </div>
  );
}

function StatCard({ title, count, color }) {
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <h3>{title}</h3>
      <p className="count">{count}</p>
    </div>
  );
}
```

### Example 6: Bulk Icon Import

```javascript
// Import icons from external source
async function importIconsFromAPI(provider) {
  try {
    const response = await fetch(`/api/icons/${provider}`);
    const icons = await response.json();
    
    iconRegistry.loadIconsFromObject(provider, icons);
    
    const stats = iconRegistry.getProviderStats();
    console.log(`Imported ${stats[provider]} ${provider.toUpperCase()} icons`);
  } catch (error) {
    console.error(`Failed to import ${provider} icons:`, error);
  }
}

// Usage
await importIconsFromAPI('aws');
await importIconsFromAPI('azure');
await importIconsFromAPI('gcp');
```

### Example 7: Icon Variation Testing

```javascript
// Test all variations for a service
function testServiceVariations(service) {
  const variations = iconRegistry.generateServiceVariations(service);
  
  console.log(`Testing variations for: ${service}`);
  console.log(`Generated variations:`, variations);
  
  variations.forEach(variant => {
    const icon = iconRegistry.getIcon('aws', variant);
    console.log(`  ${variant}: ${icon ? '✓ Found' : '✗ Not found'}`);
  });
}

// Usage
testServiceVariations('API Gateway');
// Output:
// Testing variations for: API Gateway
// Generated variations: ["apigateway", "api-gateway", "gateway"]
//   apigateway: ✓ Found
//   api-gateway: ✓ Found
//   gateway: ✗ Not found
```

---

## Debugging Guide

### Enable Debug Logging

```javascript
// Add to iconRegistry.js constructor
constructor() {
  this.icons = { aws: {}, azure: {}, gcp: {} };
  this.debug = true;  // Enable debug mode
}

// Update getIcon method
getIcon(provider, service) {
  if (this.debug) {
    console.log(`[IconRegistry] Lookup: ${provider}/${service}`);
  }
  
  const variations = this.generateServiceVariations(service);
  
  if (this.debug) {
    console.log(`[IconRegistry] Variations:`, variations);
  }
  
  for (const variant of variations) {
    const icon = this.icons[provider]?.[variant];
    if (icon) {
      if (this.debug) {
        console.log(`[IconRegistry] Match found: ${variant}`);
      }
      return icon;
    }
  }
  
  if (this.debug) {
    console.log(`[IconRegistry] No match - generating fallback`);
  }
  
  return this.getFallbackIcon(provider, service);
}
```

### Common Issues and Solutions

**Issue: Icons not loading**
```javascript
// Check if icons are loaded
console.log(iconRegistry.getProviderStats());
// Expected: { aws: 7, azure: 7, gcp: 7, total: 21 }

// If counts are 0, icons not loaded
// Solution: Check import in src/icons/index.js
```

**Issue: Wrong icon displayed**
```javascript
// Debug service name normalization
const service = "API Gateway";
const normalized = iconRegistry.normalizeServiceName(service);
console.log(`"${service}" → "${normalized}"`);

// Check variations
const variations = iconRegistry.generateServiceVariations(service);
console.log('Variations:', variations);

// Check registry keys
const awsKeys = Object.keys(iconRegistry.icons.aws);
console.log('Available AWS icons:', awsKeys);
```

**Issue: Fallback always showing**
```javascript
// Verify icon exists in registry
const hasIcon = iconRegistry.hasIcon('aws', 's3');
console.log('Has S3 icon:', hasIcon);

// If false, check icon definition
import { awsIcons } from './icons/aws.js';
console.log('AWS icon keys:', Object.keys(awsIcons));
```

---

## Best Practices Summary

1. **Always provide `service` field** in AI-generated diagrams
2. **Use lowercase service names** without spaces
3. **Include `icon` field** as Lucide fallback
4. **Test with debug mode** during development
5. **Monitor icon registry stats** for coverage
6. **Use semantic service names** that match official documentation
7. **Optimize SVGs** before adding to registry
8. **Document custom icons** with complete metadata
9. **Version icon updates** using metadata.version
10. **Profile rendering performance** with many nodes

---

## Related Documentation

- [Icon Registry Overview](./icon-registry.md)
- [Architecture Diagram Component](./architecture-diagram.md)
- [AI Prompt Engineering](./ai-prompts.md)
- [SVG Optimization Guide](./svg-optimization.md)
