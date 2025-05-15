
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Launch from './pages/Launch';
import MasterDeploymentGuide from './pages/MasterDeploymentGuide';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Trade from './pages/Trade';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/sonner"; 
import SecurityReport from './pages/SecurityReport';
import { SolanaWalletProvider } from './hooks/useSolanaWallet';
import { WalletProvider } from './hooks/useWallet';
import TokenDashboard from '@/components/TokenDashboard';

function App() {
  return (
    <SolanaWalletProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/token/:tokenId" element={<TokenDashboard />} />
            <Route path="/security-report" element={<SecurityReport />} />
            <Route path="/deployment-guide" element={<MasterDeploymentGuide />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </WalletProvider>
    </SolanaWalletProvider>
  );
}

export default App;
