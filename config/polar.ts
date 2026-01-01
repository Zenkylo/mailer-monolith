import env from '#start/env'

/**
 * Configuration for Polar.sh product tiers
 */
export default {
  // Environment-specific product mappings
  products: {
    development: {
      starter: 'bff1145b-1a39-4385-811b-71a24148b25f',
      pro: '30da02c2-e96f-4553-a339-284c6d46ab7a', // Use dev product for now
      //   enterprise: 'bff1145b-1a39-4385-811b-71a24148b25f', // Use dev product for now
    },
    production: {
      starter: 'bff1145b-1a39-4385-811b-71a24148b25f',
      pro: '30da02c2-e96f-4553-a339-284c6d46ab7a', // Replace with actual product IDs
      //   enterprise: '58a9e1bf-a335-45a3-aab7-d47dc70ce28c', // Replace with actual product IDs
    },
  },

  // Get the current environment's product mapping
  getCurrentProducts() {
    const environment = env.get('NODE_ENV') === 'production' ? 'production' : 'development'
    return this.products[environment]
  },

  // Get product ID for a specific tier
  getProductId(tier: string): string {
    const products = this.getCurrentProducts()
    return products[tier as keyof typeof products] || products.starter
  },
}
