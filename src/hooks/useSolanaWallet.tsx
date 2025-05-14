
import React, { useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { SOLANA_CONFIG } from '@/config/app.config';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// This is where you set your admin wallet public key(s)
// In a production app, this should ideally be stored in environment variables
const ADMIN_WALLET_ADDRESSES = SOLANA_CONFIG.ADMIN_WALLET_ADDRESSES;

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => SOLANA_CONFIG.RPC_ENDPOINT || clusterApiUrl(network), [network]);
  
  // Initialize all the supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Custom hook to extend the Solana wallet functionality
export function useSolanaWalletExtended() {
  const wallet = useSolanaWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if the connected wallet is an admin wallet
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      const walletAddress = wallet.publicKey.toString();
      const isWalletAdmin = ADMIN_WALLET_ADDRESSES.includes(walletAddress);
      setIsAdmin(isWalletAdmin);
      
      if (isWalletAdmin) {
        console.log('Admin wallet connected:', walletAddress);
      }
    } else {
      setIsAdmin(false);
    }
  }, [wallet.connected, wallet.publicKey]);
  
  const connect = async () => {
    if (wallet.wallet && !wallet.connected) {
      try {
        await wallet.connect();
        toast.success("Wallet connected successfully!");
      } catch (error) {
        console.error('Wallet connection error:', error);
        toast.error("Failed to connect wallet. Please try again.");
      }
    } else if (!wallet.wallet) {
      toast.error("Please select a wallet first.");
    }
  };
  
  const disconnect = async () => {
    if (wallet.connected) {
      try {
        await wallet.disconnect();
        toast.success("Wallet disconnected");
      } catch (error) {
        console.error('Wallet disconnection error:', error);
        toast.error("Failed to disconnect wallet.");
      }
    }
  };
  
  return {
    ...wallet,
    address: wallet.publicKey ? wallet.publicKey.toString() : "",
    connect,
    disconnect,
    isAdmin,
    connected: wallet.connected,
    isConnecting: wallet.connecting,
    wallet: wallet.wallet,
    publicKey: wallet.publicKey,
    isSolanaAvailable: !!window.solana,
  };
}

export default useSolanaWalletExtended;
