/**
 * Icon Registry for Cloud Provider Service Icons
 * Adapted from @cloud-diagrams/core for JavaScript/React
 */

class IconRegistry {
  constructor() {
    this.icons = {
      aws: {},
      azure: {},
      gcp: {}
    };
  }

  /**
   * Normalize service name for icon lookup
   * Handles variations like camelCase, kebab-case, spaces, etc.
   */
  normalizeServiceName(service) {
    if (!service) return '';
    
    return service
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric chars
      .trim();
  }

  /**
   * Generate variations of a service name for flexible matching
   */
  generateServiceVariations(service) {
    const normalized = this.normalizeServiceName(service);
    const variations = new Set([normalized, service.toLowerCase()]);
    
    // Add variations without common prefixes
    const withoutPrefixes = normalized
      .replace(/^(aws|azure|gcp|amazon|microsoft|google)/, '');
    if (withoutPrefixes) variations.add(withoutPrefixes);
    
    // Add variations for common abbreviations
    const abbrev = service.replace(/[^A-Z]/g, '').toLowerCase();
    if (abbrev.length >= 2) variations.add(abbrev);
    
    return Array.from(variations);
  }

  /**
   * Get icon for a specific provider and service
   * Returns icon data object or null if not found
   */
  getIcon(provider, service) {
    if (!provider || !service) return null;
    
    const normalizedProvider = provider.toLowerCase();
    if (!this.icons[normalizedProvider]) return null;
    
    // Try direct lookup first
    const normalizedService = this.normalizeServiceName(service);
    if (this.icons[normalizedProvider][normalizedService]) {
      return this.icons[normalizedProvider][normalizedService];
    }
    
    // Try variations
    const variations = this.generateServiceVariations(service);
    for (const variation of variations) {
      if (this.icons[normalizedProvider][variation]) {
        return this.icons[normalizedProvider][variation];
      }
    }
    
    return null;
  }

  /**
   * Generate a fallback icon using SVG with provider color
   */
  getFallbackIcon(provider, service) {
    const colors = {
      aws: '#FF9900',
      azure: '#0078D4',
      gcp: '#4285F4'
    };
    
    const color = colors[provider?.toLowerCase()] || '#666666';
    const initials = this.getServiceInitials(service);
    
    // Generate a simple SVG icon with service initials
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <rect width="48" height="48" rx="4" fill="${color}" opacity="0.1"/>
        <rect width="48" height="48" rx="4" fill="none" stroke="${color}" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${color}">
          ${initials}
        </text>
      </svg>
    `;
    
    const base64 = btoa(svg);
    
    return {
      svg: `data:image/svg+xml;base64,${base64}`,
      metadata: {
        name: service || 'Unknown',
        description: `${provider} ${service}`,
        category: 'other',
        provider: provider?.toLowerCase() || 'unknown',
        service: this.normalizeServiceName(service),
        isFallback: true
      }
    };
  }

  /**
   * Get initials from service name for fallback icons
   */
  getServiceInitials(service) {
    if (!service) return '??';
    
    // Remove common words
    const cleaned = service
      .replace(/\b(service|server|cloud|storage|database|compute)\b/gi, '')
      .trim();
    
    const words = cleaned.split(/[\s-_]+/).filter(w => w.length > 0);
    
    if (words.length === 0) {
      return service.substring(0, 2).toUpperCase();
    }
    
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    // Take first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  /**
   * Register a custom icon
   */
  registerIcon(provider, service, iconData) {
    const normalizedProvider = provider.toLowerCase();
    const normalizedService = this.normalizeServiceName(service);
    
    if (!this.icons[normalizedProvider]) {
      this.icons[normalizedProvider] = {};
    }
    
    this.icons[normalizedProvider][normalizedService] = iconData;
  }

  /**
   * Load icons from an object (bulk import)
   */
  loadIconsFromObject(provider, iconsObject) {
    const normalizedProvider = provider.toLowerCase();
    if (!this.icons[normalizedProvider]) {
      this.icons[normalizedProvider] = {};
    }
    
    Object.entries(iconsObject).forEach(([service, iconData]) => {
      const normalizedService = this.normalizeServiceName(service);
      this.icons[normalizedProvider][normalizedService] = iconData;
    });
  }

  /**
   * Check if an icon exists
   */
  hasIcon(provider, service) {
    return this.getIcon(provider, service) !== null;
  }

  /**
   * Get icon count for a provider
   */
  getIconCount(provider = null) {
    if (provider) {
      const normalizedProvider = provider.toLowerCase();
      return Object.keys(this.icons[normalizedProvider] || {}).length;
    }
    
    return Object.values(this.icons).reduce(
      (total, providerIcons) => total + Object.keys(providerIcons).length,
      0
    );
  }

  /**
   * Search icons by query
   */
  searchIcons(query, provider = null) {
    const results = [];
    const normalizedQuery = query.toLowerCase();
    
    const providers = provider ? [provider.toLowerCase()] : ['aws', 'azure', 'gcp'];
    
    providers.forEach(prov => {
      Object.entries(this.icons[prov] || {}).forEach(([service, iconData]) => {
        const metadata = iconData.metadata || {};
        const searchText = [
          metadata.name,
          metadata.description,
          metadata.service,
          ...(metadata.tags || [])
        ].join(' ').toLowerCase();
        
        if (searchText.includes(normalizedQuery)) {
          results.push({ ...iconData, provider: prov, service });
        }
      });
    });
    
    return results;
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    return {
      aws: this.getIconCount('aws'),
      azure: this.getIconCount('azure'),
      gcp: this.getIconCount('gcp'),
      total: this.getIconCount()
    };
  }
}

// Create and export singleton instance
const iconRegistry = new IconRegistry();

export default iconRegistry;
