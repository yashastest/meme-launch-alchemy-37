import React, { createContext, useContext } from "react";
import useSolanaWalletExtended from "./useSolanaWallet";

// Wallet context type
interface WalletContextType {
  wallet: string | null;
  isConnecting: boolean;
  connected: boolean;
  address: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectPhantom: () => Promise<void>;
  connectHardwareWallet: () => Promise<void>;
  isSolanaAvailable: boolean;
  isHardwareWallet: boolean;
  isAdmin: boolean;  // New property to track admin status
  publicKey: any;    // Public key from Solana
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// This provider now wraps around the Solana wallet functionality
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our extended Solana wallet hook
  const solanaWallet = useSolanaWalletExtended();
  
  // For backward compatibility, we'll keep isHardwareWallet
  // In a real implementation, this would be determined by the wallet adapter
  const [isHardwareWallet, setIsHardwareWallet] = React.useState(false);
  
  // Connect to Phantom wallet
  const connectPhantom = async () => {
    // Since our Solana wallet adapter already supports Phantom, we just call connect
    await solanaWallet.connect();
    setIsHardwareWallet(false);
  };
  
  // Connect to hardware wallet (like Ledger)
  const connectHardwareWallet = async () => {
    // In a real implementation, you would use a hardware wallet adapter
    // For now, we'll use the same connect method but mark it as a hardware wallet
    await solanaWallet.connect();
    setIsHardwareWallet(true);
  };
  
  return (
    <WalletContext.Provider value={{ 
      wallet: solanaWallet.address || null, 
      isConnecting: solanaWallet.isConnecting, 
      connect: solanaWallet.connect,
      disconnect: solanaWallet.disconnect,
      connectPhantom,
      connectHardwareWallet,
      isSolanaAvailable: solanaWallet.isSolanaAvailable,
      isHardwareWallet,
      connected: solanaWallet.connected,
      address: solanaWallet.address,
      isAdmin: solanaWallet.isAdmin,
      publicKey: solanaWallet.publicKey
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
