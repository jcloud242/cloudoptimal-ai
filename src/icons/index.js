/**
 * Icon Registry initialization
 * Loads all provider icons into the registry
 */

import iconRegistry from './iconRegistry.js';
import { awsIcons } from './aws.js';
import { azureIcons } from './azure.js';
import { gcpIcons } from './gcp.js';

// Load all provider icons
iconRegistry.loadIconsFromObject('aws', awsIcons);
iconRegistry.loadIconsFromObject('azure', azureIcons);
iconRegistry.loadIconsFromObject('gcp', gcpIcons);

// Log icon counts for debugging
console.log('Icon Registry loaded:', iconRegistry.getProviderStats());

export default iconRegistry;
export { awsIcons, azureIcons, gcpIcons };
