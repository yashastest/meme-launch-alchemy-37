
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { useAdmin } from '@/hooks/useAdmin';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader } from 'lucide-react';

// Lazy load components for better performance
const Dashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const Analytics = lazy(() => import('@/components/admin/AnalyticsDashboard'));
const Settings = lazy(() => import('@/components/admin/AdminSettings'));
const PendingApprovals = lazy(() => import('@/components/admin/PendingApprovals'));
const SmartContractDashboard = lazy(() => import('@/components/admin/SmartContractDashboard'));
const SmartContractDeployment = lazy(() => import('@/components/admin/SmartContractDeployment'));
const SmartContractTestnet = lazy(() => import('@/components/admin/SmartContractTestnet'));
const DeploymentEnvironment = lazy(() => import('@/components/admin/DeploymentEnvironment'));
const DeploymentGuide = lazy(() => import('@/components/admin/DeploymentGuide'));
const TreasuryWalletManager = lazy(() => import('@/components/admin/TreasuryWalletManager'));
const AboutProject = lazy(() => import('@/components/admin/AboutProject'));
const AdminUserManager = lazy(() => import('@/components/admin/AdminUserManager'));
const HardwareWalletManager = lazy(() => import('@/components/admin/HardwareWalletManager'));
const BondingCurveTester = lazy(() => import('@/components/admin/BondingCurveTester'));

// Loading component
const LoadingFallback = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <Loader className="h-10 w-10 animate-spin text-wybe-primary" />
  </div>
);

const Admin = () => {
  const { isAuthenticated, isLoading, authCheckCompleted } = useAdmin();
  const [contentReady, setContentReady] = useState(false);
  const navigate = useNavigate();
  useScrollToTop();

  // Only check authentication once and handle rendering state
  useEffect(() => {
    if (authCheckCompleted) {
      if (!isAuthenticated) {
        navigate('/admin-login', { replace: true });
      } else {
        // Small delay to ensure everything is ready
        const timer = setTimeout(() => {
          setContentReady(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [authCheckCompleted, isAuthenticated, navigate]);

  // Show loading state until authentication check is complete
  if (isLoading || !authCheckCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-wybe-primary" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="container py-8 max-w-7xl">
          {contentReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/approvals" element={<PendingApprovals />} />
                  <Route path="/contracts" element={<SmartContractDashboard />} />
                  <Route path="/deployment" element={<SmartContractDeployment />} />
                  <Route path="/testnet" element={<SmartContractTestnet />} />
                  <Route path="/environment" element={<DeploymentEnvironment />} />
                  <Route path="/guide" element={<DeploymentGuide />} />
                  <Route path="/treasury" element={<TreasuryWalletManager />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/about" element={<AboutProject />} />
                  <Route path="/platform" element={<BondingCurveTester />} />
                  <Route path="/users" element={<AdminUserManager />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/hardware-wallet" element={<HardwareWalletManager />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </Suspense>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
