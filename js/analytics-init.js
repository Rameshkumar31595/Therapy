/**
 * Vercel Web Analytics Initialization
 * This script initializes Vercel Web Analytics for the site
 */

// Import and inject analytics
import { inject } from './vercel-analytics.js';

// Initialize analytics with default settings
inject({
  mode: 'auto', // Automatically detect environment (production/development)
  debug: false  // Disable debug logging in production
});
