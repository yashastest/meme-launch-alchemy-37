
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { tradingService } from './services/tradingService';
import { smartContractService } from './services/smartContractService';

// Polyfill global variables for browser compatibility
window.global = window;
window.process = window.process || { env: {} };
window.Buffer = window.Buffer || { isBuffer: () => false };

// Sync configurations between services on startup
const initializeServices = () => {
  const tradingConfig = tradingService.getConfig();
  
  // Ensure trading service and smart contract service have consistent settings
  smartContractService.updateContractConfig({
    creatorFeePercentage: tradingConfig.creatorFeePercentage,
    rewardClaimPeriodDays: tradingConfig.rewardClaimPeriod,
    dexScreenerThreshold: tradingConfig.dexscreenerThreshold
  });
  
  // Get updated contract config for logging
  const contractConfig = smartContractService.getContractConfig();
  
  console.log("Services initialized with the following configuration:");
  console.log("- Creator fee:", contractConfig.creatorFeePercentage + "%");
  console.log("- Reward claim period:", contractConfig.rewardClaimPeriodDays + " days");
  console.log("- DEXScreener threshold: $" + contractConfig.dexScreenerThreshold);
};

// Mock the solana object for testing
if (typeof window !== 'undefined' && !window.solana) {
  window.solana = {
    isPhantom: false,
    connect: async () => ({ 
      publicKey: { 
        toString: () => "PhantomMockWallet123456789" 
      } 
    }),
    disconnect: async () => {}
  };
}

// Initialize services
initializeServices();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
