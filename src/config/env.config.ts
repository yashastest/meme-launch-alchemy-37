/**
 * Environment configuration for the application
 */
export const ENV_CONFIG = {
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/wybe',
  
  // Solana configuration
  SOLANA_CLUSTER: process.env.SOLANA_CLUSTER || 'devnet',
  SOLANA_RPC_ENDPOINT: process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
  PROGRAM_ID: process.env.PROGRAM_ID || 'Wyb111111111111111111111111111111111111111',
  TREASURY_WALLET: process.env.TREASURY_WALLET || 'Wyb111111111111111111111111111111111111111',
  
  // JWT for admin authentication
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-for-jwt-tokens',
  
  // Other configurations
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

export default ENV_CONFIG;
