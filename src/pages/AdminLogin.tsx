import React, { useEffect } from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminLoginForm from '@/components/AdminLoginForm';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { useWallet } from '@/hooks/useWallet';

const AdminLogin = () => {
  // Ensure the page starts at the top when loaded
  useScrollToTop();
  const navigate = useNavigate();
  const { connected, isAdmin } = useWallet();
  
  useEffect(() => {
    // If wallet is connected and is an admin wallet, redirect to admin panel
    if (connected && isAdmin) {
      console.log("Admin wallet already connected, redirecting to admin panel");
      navigate('/admin', { replace: true });
      return;
    }
    
    // Otherwise check for traditional login
    const isLoggedIn = localStorage.getItem("wybeAdminLoggedIn") === "true";
    const sessionExists = !!sessionStorage.getItem("wybeAdminSession");
    
    if (isLoggedIn && sessionExists) {
      // Use replace: true to avoid history issues
      navigate('/admin', { replace: true });
      return;
    }
    
    // Clear any stale session data when arriving at login page
    // but only if we're not already logged in
    if (!isLoggedIn || !sessionExists) {
      localStorage.removeItem("wybeAdminLoggedIn");
      sessionStorage.removeItem("wybeAdminSession");
    }
  }, [navigate, connected, isAdmin]);
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-16 px-4 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AdminLoginForm />
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLogin;
