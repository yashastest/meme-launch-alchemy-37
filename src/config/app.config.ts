
/**
 * Application Configuration
 * 
 * This file contains centralized configuration settings for the application.
 * In a production environment, sensitive values should be stored in environment
 * variables or secured through a separate configuration management system.
 */

export const SOLANA_CONFIG = {
  // The network to connect to: 'mainnet-beta', 'testnet', or 'devnet'
  NETWORK: 'mainnet-beta',
  
  // List of wallet addresses that have admin privileges
  // In production, consider storing these in environment variables 
  // and making them not visible on the client side
  ADMIN_WALLET_ADDRESSES: [
    'GoodKHf7DgxtVpPqNvJ3NU9mZRGaAAGK2TsqzAbowLdF', // Replace with actual admin wallet address
  ],
  
  // RPC endpoint - use a reliable RPC provider in production
  // Default to public endpoint, but consider using a dedicated RPC service
  RPC_ENDPOINT: 'https://api.mainnet-beta.solana.com',
};

export const API_CONFIG = {
  // CoinGecko API settings
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    // API key would go here if using the pro version
    // API_KEY: process.env.COINGECKO_API_KEY,
    CACHE_DURATION: 60, // Cache duration in seconds
  },
};

export const APP_CONFIG = {
  // Application name
  APP_NAME: 'Wybe Token Launchpad',
  
  // Feature flags
  FEATURES: {
    REAL_WALLET_CONNECTION: true,
    LIVE_COIN_DATA: true,
    MOCK_TRADING: true, // Set to false when real trading is implemented
  },
  
  // Admin session configuration
  ADMIN: {
    SESSION_DURATION: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    LOCAL_STORAGE_KEY: 'wybeAdminLoggedIn',
    SESSION_STORAGE_KEY: 'wybeAdminSession',
  },
};

export default {
  SOLANA: SOLANA_CONFIG,
  API: API_CONFIG,
  APP: APP_CONFIG,
};
