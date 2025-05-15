
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
  process: {
    env: Record<string, string> | {};
    [key: string]: any; // Allow for additional properties without strict typing
  };
  Buffer: {
    isBuffer?: (obj: any) => boolean;
    [key: string]: any;
  };
}

// Make Process interface optional to avoid strict compatibility checks
declare global {
  interface Process {
    env: Record<string, string>;
    [key: string]: any;
  }
}

export {};
