
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { tradingService } from './services/tradingService';
import { smartContractService } from './services/smartContractService';
import { BrowserRouter } from 'react-router-dom';

// Polyfill global variables for browser compatibility
window.global = window;

// Create a minimal process polyfill for browser environment
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    // Basic properties to satisfy requirements without type errors
    argv: [],
    stdout: null,
    stderr: null,
    stdin: null,
    version: '',
    versions: {},
    platform: '',
    nextTick: (fn: () => void) => setTimeout(fn, 0),
    cwd: () => '/',
    // Add empty functions for other Process properties
    abort: () => {},
    chdir: () => {},
    exit: () => {},
    // And any other properties that might be referenced
  };
}

// Ensure Buffer is available
window.Buffer = window.Buffer || { 
  isBuffer: () => false,
  from: () => ({}),
  alloc: () => ({})
};

// Sync configurations between services on startup
const initializeServices = () => {
  try {
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
  } catch (error) {
    console.warn("Failed to initialize services:", error);
    // Continue loading the app despite service initialization errors
  }
};

// Mock the solana object for testing if not available
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

// Initialize services but continue if there's an error
try {
  initializeServices();
} catch (error) {
  console.warn("Service initialization failed, continuing with defaults:", error);
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
