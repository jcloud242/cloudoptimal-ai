# Icon Registry System

## Overview

The Icon Registry is a centralized system for managing and retrieving provider-specific cloud service icons for AWS, Azure, and Google Cloud Platform. It provides automatic icon lookup, flexible service name matching, and fallback icon generation for architecture diagrams.

## Architecture

### Core Components

```
src/icons/
├── iconRegistry.js     # Core IconRegistry class
├── aws.js             # AWS service icons
├── azure.js           # Azure service icons
├── gcp.js             # GCP service icons
└── index.js           # Registry initialization and exports
```

### Data Flow

```
Diagram Component Request
        ↓
getNodeIcon(node)
        ↓
iconRegistry.getIcon(provider, service)
        ↓
    ┌───────────────────────┐
    │ Service Normalization │
    │  - Remove spaces       │
    │  - Lowercase           │
    │  - Strip special chars │
    └───────────────────────┘
        ↓
    ┌───────────────────────┐
    │ Generate Variations   │
    │  - camelCase          │
    │  - kebab-case         │
    │  - without prefix     │
    └───────────────────────┘
        ↓
    ┌───────────────────────┐
    │ Icon Lookup           │
    │  - Try exact match    │
    │  - Try variations     │
    │  - Return icon data   │
    └───────────────────────┘
        ↓
   Found? ──Yes──→ Return provider icon
        │
       No
        ↓
   Generate fallback SVG
   (provider color + initials)
```

## Icon Registry API

### IconRegistry Class

```javascript
class IconRegistry {
  constructor()
  normalizeServiceName(service)
  generateServiceVariations(service)
  getIcon(provider, service)
  getFallbackIcon(provider, service)
  getServiceInitials(service)
  registerIcon(provider, service, iconData)
  loadIconsFromObject(provider, iconsObject)
  hasIcon(provider, service)
  getIconCount(provider)
  searchIcons(query)
  getProviderStats()
}
```

### Key Methods

#### `getIcon(provider, service)`

Primary method for retrieving provider-specific icons.

**Parameters:**
- `provider` (string): Cloud provider - 'aws', 'azure', or 'gcp'
- `service` (string): Service name - flexible format (camelCase, kebab-case, spaces, etc.)

**Returns:**
```javascript
{
  svg: "data:image/svg+xml;base64,...",  // Base64 encoded SVG
  metadata: {
    name: "Service Name",
    description: "Service description",
    category: "compute|storage|database|networking|...",
    provider: "aws|azure|gcp",
    service: "service-identifier",
    tags: ["tag1", "tag2"],
    version: "1.0.0"
  }
}
```

**Example:**
```javascript
// All these variations will find the same icon:
iconRegistry.getIcon('aws', 's3')
iconRegistry.getIcon('aws', 'S3')
iconRegistry.getIcon('aws', 'Amazon S3')
iconRegistry.getIcon('aws', 'amazon-s3')
```

#### `normalizeServiceName(service)`

Converts service names to consistent format for lookup.

**Process:**
1. Convert to lowercase
2. Remove non-alphanumeric characters (except hyphens)
3. Trim whitespace

**Examples:**
```javascript
normalizeServiceName('Amazon S3')        // 's3'
normalizeServiceName('Azure Functions')  // 'azurefunctions'
normalizeServiceName('Cloud-Storage')    // 'cloudstorage'
normalizeServiceName('EC2 Instance')     // 'ec2instance'
```

#### `generateServiceVariations(service)`

Creates multiple naming variations for flexible matching.

**Returns:** Array of variation strings

**Examples:**
```javascript
generateServiceVariations('cloudstorage')
// Returns: [
//   'cloudstorage',
//   'cloud-storage',
//   'storage',
//   'cloud'
// ]

generateServiceVariations('apigateway')
// Returns: [
//   'apigateway',
//   'api-gateway',
//   'gateway',
//   'api'
// ]
```

#### `getFallbackIcon(provider, service)`

Generates SVG icon when service icon not found.

**Features:**
- Provider-specific background color
- Service initials (first 2 letters)
- Professional rounded square design
- Base64 encoded for inline use

**Example Output:**
```javascript
{
  svg: "data:image/svg+xml;base64,PHN2Zy4uLg==",
  metadata: {
    name: "Lambda",
    description: "Generated fallback icon",
    category: "fallback",
    provider: "aws",
    service: "lambda",
    tags: ["fallback", "generated"],
    version: "1.0.0"
  }
}
```

#### `searchIcons(query)`

Search across all providers by service name, tags, or description.

**Parameters:**
- `query` (string): Search term (case-insensitive)

**Returns:** Array of matching icons with metadata

**Example:**
```javascript
iconRegistry.searchIcons('database')
// Returns all database-related icons from all providers
// [
//   { provider: 'aws', service: 'rds', metadata: {...} },
//   { provider: 'aws', service: 'dynamodb', metadata: {...} },
//   { provider: 'azure', service: 'sqldatabase', metadata: {...} },
//   { provider: 'gcp', service: 'cloudsql', metadata: {...} }
// ]
```

#### `getProviderStats()`

Get statistics about loaded icons.

**Returns:**
```javascript
{
  aws: 7,
  azure: 7,
  gcp: 7,
  total: 21
}
```

## Icon Data Structure

### Icon Definition Format

Each icon follows this structure:

```javascript
{
  svg: "data:image/svg+xml;base64,<base64-encoded-svg>",
  metadata: {
    name: "Human-readable service name",
    description: "What this service does",
    category: "Service category",
    provider: "aws|azure|gcp",
    service: "normalized-service-identifier",
    tags: ["keyword1", "keyword2", "keyword3"],
    version: "1.0.0"
  }
}
```

### Icon Categories

- **compute**: EC2, Virtual Machines, Compute Engine, Lambda, Functions
- **storage**: S3, Blob Storage, Cloud Storage
- **database**: RDS, DynamoDB, SQL Database, Cloud SQL, Firestore
- **networking**: CloudFront, CDN, Load Balancers, API Gateway
- **container**: ECS, EKS, Container Instances, Kubernetes Engine
- **serverless**: Lambda, Functions, Cloud Functions
- **monitoring**: CloudWatch, Monitor, Cloud Logging
- **security**: IAM, Key Vault, Security Center, Cloud IAM
- **analytics**: Athena, Synapse Analytics, BigQuery

### Example Icon Files

**AWS Icons (src/icons/aws.js):**
```javascript
export const awsIcons = {
  s3: {
    svg: "data:image/svg+xml;base64,...",
    metadata: {
      name: "Amazon S3",
      description: "Object storage service",
      category: "storage",
      provider: "aws",
      service: "s3",
      tags: ["storage", "object", "bucket"],
      version: "1.0.0"
    }
  },
  lambda: {
    svg: "data:image/svg+xml;base64,...",
    metadata: {
      name: "AWS Lambda",
      description: "Serverless compute service",
      category: "serverless",
      provider: "aws",
      service: "lambda",
      tags: ["serverless", "compute", "function"],
      version: "1.0.0"
    }
  }
  // ... more icons
};
```

## Integration with Architecture Diagrams

### Component Integration

The Icon Registry integrates with the `ArchitectureDiagram` component through the `getNodeIcon` function:

```javascript
import iconRegistry from '../icons';

// In ArchitectureDiagram component:
const getNodeIcon = (node) => {
  // Try provider-specific icon first (if service field exists)
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

### Node Schema with Service Field

AI prompts now include a `service` field for automatic icon lookup:

```javascript
{
  "id": "storage-layer",
  "label": "S3 Bucket",
  "layer": "data",
  "type": "storage",
  "service": "s3",  // ← Enables provider icon lookup
  "icon": "HardDrive",  // ← Fallback if service icon not found
  "description": "Primary data storage",
  "cost": "$23"
}
```

### Icon Rendering Logic

The diagram component conditionally renders icons based on type:

```jsx
{iconInfo.type === 'provider' ? (
  /* Provider-specific SVG icon */
  <image
    x={-16}
    y={-28}
    width={32}
    height={32}
    href={iconInfo.data.svg}
    preserveAspectRatio="xMidYMid meet"
  />
) : (
  /* Lucide icon fallback */
  <foreignObject x={-14} y={-25} width={28} height={28}>
    <div className="flex items-center justify-center">
      <iconInfo.Icon className="w-7 h-7" style={{ color: theme.primary }} />
    </div>
  </foreignObject>
)}
```

## Service Name Mapping

### AWS Service Names

| Display Name | Service Field | Variations Supported |
|-------------|--------------|---------------------|
| Amazon S3 | `s3` | s3, S3, Amazon S3, amazon-s3 |
| EC2 | `ec2` | ec2, EC2, Elastic Compute |
| Lambda | `lambda` | lambda, Lambda, AWS Lambda |
| RDS | `rds` | rds, RDS, Relational Database |
| DynamoDB | `dynamodb` | dynamodb, DynamoDB, dynamo-db |
| CloudFront | `cloudfront` | cloudfront, CloudFront, cloud-front |
| API Gateway | `apigateway` | apigateway, API Gateway, api-gateway |

### Azure Service Names

| Display Name | Service Field | Variations Supported |
|-------------|--------------|---------------------|
| Blob Storage | `blob` | blob, Blob, Azure Blob |
| Virtual Machines | `virtualmachines` | virtualmachines, VM, virtual-machines |
| Functions | `functions` | functions, Azure Functions |
| SQL Database | `sqldatabase` | sqldatabase, SQL Database, sql-database |
| Cosmos DB | `cosmosdb` | cosmosdb, Cosmos DB, cosmos-db |
| CDN | `cdn` | cdn, CDN, Azure CDN |
| API Management | `apimanagement` | apimanagement, API Management, api-management |

### GCP Service Names

| Display Name | Service Field | Variations Supported |
|-------------|--------------|---------------------|
| Cloud Storage | `cloudstorage` | cloudstorage, Cloud Storage, cloud-storage, storage |
| Compute Engine | `computeengine` | computeengine, Compute Engine, compute-engine, engine |
| Cloud Functions | `cloudfunctions` | cloudfunctions, Cloud Functions, cloud-functions, functions |
| Cloud SQL | `cloudsql` | cloudsql, Cloud SQL, cloud-sql, sql |
| Firestore | `firestore` | firestore, Firestore, fire-store |
| Cloud CDN | `cloudcdn` | cloudcdn, Cloud CDN, cloud-cdn, cdn |
| Apigee | `apigee` | apigee, Apigee, API Gateway |

## Fallback Strategy

The system implements a three-tier fallback strategy:

```
1. Provider Icon (from registry)
       ↓ (not found)
2. Generated Fallback Icon (provider color + initials)
       ↓ (for component rendering)
3. Lucide Icon (from node.icon field)
       ↓ (not specified)
4. Generic Box Icon
```

### Fallback Icon Generation

When a service icon is not found in the registry, the system generates a professional-looking fallback:

**Features:**
- Provider-specific color scheme:
  - AWS: `#FF9900` (orange)
  - Azure: `#0078D4` (blue)
  - GCP: `#4285F4` (blue)
- Service initials extracted from service name
- Rounded square design (8px radius)
- White text on colored background
- Standard 32x32 viewBox

**Example Generated SVG:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#FF9900"/>
  <text 
    x="16" 
    y="20" 
    font-family="Arial, sans-serif" 
    font-size="14" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle">
    LA
  </text>
</svg>
```

## Usage Examples

### Basic Icon Lookup

```javascript
import iconRegistry from '../icons';

// Get AWS S3 icon
const s3Icon = iconRegistry.getIcon('aws', 's3');
// Returns: { svg: "data:image/svg+xml;base64,...", metadata: {...} }

// Use in component
<image href={s3Icon.svg} width={32} height={32} />
```

### Search Across Providers

```javascript
// Find all compute-related services
const computeServices = iconRegistry.searchIcons('compute');

// Find all serverless services
const serverlessServices = iconRegistry.searchIcons('serverless');

// Find specific service
const s3Results = iconRegistry.searchIcons('s3');
```

### Add Custom Icons

```javascript
// Register a new icon
iconRegistry.registerIcon('aws', 'elasticache', {
  svg: "data:image/svg+xml;base64,...",
  metadata: {
    name: "Amazon ElastiCache",
    description: "In-memory caching service",
    category: "cache",
    provider: "aws",
    service: "elasticache",
    tags: ["cache", "redis", "memcached"],
    version: "1.0.0"
  }
});

// Bulk load icons
import { customAwsIcons } from './custom-icons';
iconRegistry.loadIconsFromObject('aws', customAwsIcons);
```

### Check Icon Availability

```javascript
// Check if icon exists
if (iconRegistry.hasIcon('aws', 'lambda')) {
  console.log('Lambda icon available');
}

// Get icon counts
const stats = iconRegistry.getProviderStats();
console.log(`Total icons: ${stats.total}`);
console.log(`AWS icons: ${stats.aws}`);
console.log(`Azure icons: ${stats.azure}`);
console.log(`GCP icons: ${stats.gcp}`);
```

## Extending the Icon Registry

### Adding New Provider Icons

1. **Create provider icon file** (e.g., `src/icons/oci.js`):

```javascript
export const ociIcons = {
  objectstorage: {
    svg: "data:image/svg+xml;base64,...",
    metadata: {
      name: "Object Storage",
      description: "Oracle Cloud object storage",
      category: "storage",
      provider: "oci",
      service: "objectstorage",
      tags: ["storage", "object", "bucket"],
      version: "1.0.0"
    }
  }
};
```

2. **Load in index.js**:

```javascript
import { ociIcons } from './oci.js';

iconRegistry.loadIconsFromObject('oci', ociIcons);
```

### Adding More Service Icons

To expand icon coverage for existing providers:

1. **Obtain official icons**: Download from provider icon libraries
   - [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
   - [Azure Architecture Icons](https://learn.microsoft.com/en-us/azure/architecture/icons/)
   - [GCP Architecture Icons](https://cloud.google.com/icons)

2. **Convert to base64**:
```bash
# Using command line
base64 -i icon.svg -o icon.txt

# Or use online tool
https://base64.guru/converter/encode/image/svg
```

3. **Add to provider file**:
```javascript
export const awsIcons = {
  // ... existing icons
  
  elasticache: {
    svg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDo...",
    metadata: {
      name: "Amazon ElastiCache",
      description: "In-memory caching service",
      category: "cache",
      provider: "aws",
      service: "elasticache",
      tags: ["cache", "redis", "memcached"],
      version: "1.0.0"
    }
  }
};
```

## Performance Considerations

### Icon Loading

- **Singleton Pattern**: Icon registry initialized once on application load
- **Lazy Loading**: Icons only loaded when registry is imported
- **Base64 Encoding**: Inline SVG data eliminates network requests
- **Memory Footprint**: ~21 icons ≈ 50KB in memory (acceptable for web apps)

### Lookup Performance

- **O(1) Access**: Direct object property lookup by service name
- **O(n) Variations**: Linear search through variations (typically 3-5 items)
- **Caching**: Registry maintains single icon map, no repeated parsing

### Optimization Tips

1. **Minimize SVG Size**: Optimize SVGs before encoding
```bash
# Using svgo
npx svgo input.svg -o output.svg
```

2. **Use CDN URLs** for large icon sets (alternative to base64):
```javascript
{
  svg: "https://cdn.example.com/icons/aws/s3.svg",
  metadata: {...}
}
```

3. **Lazy Load Providers**: Only import needed providers
```javascript
// Instead of loading all in index.js
import { awsIcons } from './aws.js';
iconRegistry.loadIconsFromObject('aws', awsIcons);
```

## Troubleshooting

### Icon Not Displaying

**Problem**: Icon not showing in diagram

**Checklist:**
1. ✓ Check `node.service` field is populated in diagram data
2. ✓ Verify service name matches icon registry (check variations)
3. ✓ Confirm provider is set correctly ('aws', 'azure', or 'gcp')
4. ✓ Check browser console for icon registry load messages
5. ✓ Verify icon data has valid base64 SVG

**Debug:**
```javascript
// Check if icon exists
console.log(iconRegistry.hasIcon('aws', 's3'));

// Get icon data
const icon = iconRegistry.getIcon('aws', 's3');
console.log(icon);

// Check variations
const variations = iconRegistry.generateServiceVariations('s3');
console.log(variations);
```

### Fallback Icon Always Showing

**Problem**: Always seeing generated fallback (initials) instead of provider icon

**Causes:**
- Service name mismatch between diagram data and icon registry
- Icon not loaded into registry
- Provider not specified in diagram data

**Solution:**
```javascript
// Check exact service name in registry
const stats = iconRegistry.getProviderStats();
console.log(stats);

// Search for service
const results = iconRegistry.searchIcons('s3');
console.log(results);
```

### Wrong Icon Displayed

**Problem**: Incorrect icon showing for service

**Causes:**
- Service name collision across providers
- Incorrect provider specified in diagram data

**Solution:**
- Ensure diagram `provider` field matches intended cloud provider
- Use provider-prefixed service names in multi-cloud diagrams

## Best Practices

### Service Naming

1. **Use lowercase** for service field values
2. **Remove spaces** (use camelCase or kebab-case)
3. **Be specific** (use official service names when possible)
4. **Consistent format** across your application

✅ **Good:**
```javascript
{ service: "s3" }
{ service: "lambda" }
{ service: "cloudstorage" }
```

❌ **Avoid:**
```javascript
{ service: "Amazon S3 Bucket" }  // Too verbose
{ service: "AWS-Lambda-Function" }  // Too specific
{ service: "Storage" }  // Too generic
```

### Icon Metadata

1. **Complete descriptions** for searchability
2. **Relevant tags** for categorization
3. **Accurate categories** for filtering
4. **Version tracking** for updates

### Fallback Strategy

1. **Always provide** `icon` field as Lucide fallback
2. **Use semantic icons** that match service type
3. **Test with missing icons** to verify fallback behavior

## Future Enhancements

### Planned Features

- **Icon Variants**: Support for light/dark/colored themes
- **Dynamic Icon Loading**: Load icons on-demand from CDN
- **Icon Versioning**: Track and update icon versions
- **Custom Icon Upload**: UI for adding custom icons
- **Icon Analytics**: Track which icons are most used
- **Multi-language**: Icon descriptions in multiple languages
- **Icon Preview**: Visual browser for all available icons

### Community Contributions

Want to add more icons? Here's how:

1. Fork the repository
2. Add icons to appropriate provider file
3. Follow existing data structure
4. Include metadata with tags
5. Submit pull request with documentation

## Related Documentation

- [Architecture Diagram Component](./architecture-diagram.md)
- [AI Prompt Engineering](./ai-prompts.md)
- [Provider Theme Configuration](./provider-themes.md)
- [SVG Rendering Guide](./svg-rendering.md)

## Support

For issues or questions:
- GitHub Issues: [cloudoptimal-ai/issues](https://github.com/jcloud242/cloudoptimal-ai/issues)
- Documentation: [docs.cloudoptimal.ai](https://docs.cloudoptimal.ai)
