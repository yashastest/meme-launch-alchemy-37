
/// <reference types="vite/client" />

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect?: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: (transaction: any) => Promise<any>;
    signAllTransactions?: (transactions: any[]) => Promise<any[]>;
    request?: (request: { method: string; params?: any }) => Promise<any>;
    on?: (event: string, listener: (...args: any[]) => void) => void;
    off?: (event: string, listener: (...args: any[]) => void) => void;
    publicKey?: { toString: () => string };
  };
  global: typeof globalThis;
  process: any; // Change to any to avoid type issues
  Buffer: {
    isBuffer?: (obj: any) => boolean;
    [key: string]: any;
  };
}

// Remove all Process interface definitions
declare global {
  var process: any; // Use 'any' type to avoid strict type checking
}

export {};
