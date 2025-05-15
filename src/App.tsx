
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Launch from './pages/Launch';
import LaunchPackage from './pages/LaunchPackage';
import Discover from './pages/Discover';
import Trade from './pages/Trade';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner"; 
import SecurityReport from './pages/SecurityReport';
import { SolanaWalletProvider } from './hooks/useSolanaWallet';
import { WalletProvider } from './hooks/useWallet';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SolanaWalletProvider>
        <WalletProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/package" element={<LaunchPackage />} />
            <Route path="/launch/:packageId" element={<LaunchPackage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/security-report" element={<SecurityReport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" />
        </WalletProvider>
      </SolanaWalletProvider>
    </div>
  );
}

export default App;
