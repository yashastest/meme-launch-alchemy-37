
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false, // Allow serving files from outside of the project root
    },
  },
  plugins: [
    react(),
    process.env.NODE_ENV !== 'production' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Node.js polyfills - simplified to prevent TypeScript issues
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ["@coral-xyz/anchor", "@solana/web3.js"], // Don't optimize these packages
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        })
      ]
    }
  }
});
