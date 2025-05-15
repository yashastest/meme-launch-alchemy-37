
/// <reference types="vite/client" />

// Define global window extensions for Solana wallet and process polyfills
interface Window {
  solana?: {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    [key: string]: any;
  };
  process?: any;
  global?: any;
  Buffer?: {
    isBuffer: (obj: any) => boolean;
    [key: string]: any;
  };
}

// Add missing interfaces for API compatibility
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOLANA_RPC_URL: string;
  readonly VITE_SOLANA_NETWORK: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Explicitly declare process as any type to avoid TypeScript errors
declare global {
  var process: any;
  var global: any;
  var Buffer: any;
}
