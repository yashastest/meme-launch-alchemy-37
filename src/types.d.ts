
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
    };
    Buffer: any;
  }
}

export {};
