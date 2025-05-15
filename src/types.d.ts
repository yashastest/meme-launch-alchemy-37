
// Global type definitions
interface Window {
  solana: {
    isPhantom: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
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
  Buffer: any;
}

// Declare NodeJS global variables on the window object
declare global {
  interface Window {
    solana: any;
    global: typeof globalThis;
    process: {
      env: Record<string, string>;
      [key: string]: any; // Allow for additional properties
    };
    Buffer: any;
  }
  
  // Define a simplified Process interface for our use
  interface Process {
    env: Record<string, string>;
    [key: string]: any; // Allow for additional properties
  }
}

export {};
