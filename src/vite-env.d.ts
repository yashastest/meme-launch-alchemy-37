
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
    env: Record<string, string>;
    argv: any[];
    stdout: any;
    stderr: any;
    stdin: any;
    version: string;
    versions: Record<string, any>;
    platform: string;
    nextTick: (fn: () => void) => any;
    cwd: () => string;
    [key: string]: any; // Allow for additional properties
  };
  Buffer: {
    isBuffer: (obj: any) => boolean;
    [key: string]: any;
  };
}

declare global {
  interface Process {
    env: Record<string, string>;
    [key: string]: any; // Allow for additional properties
  }
}

export {};
