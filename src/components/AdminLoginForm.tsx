
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, Wallet } from "lucide-react";
import AdminPasswordReset from "./AdminPasswordReset";
import { useWallet } from '@/hooks/useWallet';

const AdminLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  const navigate = useNavigate();
  
  // Get wallet connection status
  const { connect, connected, isAdmin } = useWallet();

  // Check if admin is already authenticated with wallet
  useEffect(() => {
    if (connected && isAdmin) {
      toast.success('Authenticated with admin wallet');
      navigate('/admin', { replace: true });
    }
  }, [connected, isAdmin, navigate]);

  const handleWalletLogin = async () => {
    setIsLoading(true);
    
    try {
      await connect();
      
      // Admin check will happen in the wallet hook
      // If the wallet is an admin wallet, navigation will happen automatically from the useEffect
      
      setTimeout(() => {
        // If we're still here after connection, it means the wallet is not an admin wallet
        if (connected && !isAdmin) {
          toast.error('Connected wallet is not authorized as admin');
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Wallet login error:', error);
      toast.error('Failed to connect wallet. Please try traditional login.');
      setIsLoading(false);
    }
  };

  const handleTraditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fallback to traditional login
    if (username === 'admin' && password === 'password') {
      console.log("Credentials valid, setting session data");
      
      // Create session data with permissions
      const sessionData = {
        username: 'admin',
        permissions: ['all'], // Super admin has all permissions
        loginTime: Date.now(),
        expiryTime: Date.now() + (12 * 60 * 60 * 1000), // 12 hour expiry
      };
      
      try {
        // Set fresh session data
        localStorage.setItem('wybeAdminLoggedIn', 'true');
        sessionStorage.setItem('wybeAdminSession', JSON.stringify(sessionData));
        
        console.log("Session data set:", {
          isLoggedIn: localStorage.getItem('wybeAdminLoggedIn'),
          sessionExists: !!sessionStorage.getItem('wybeAdminSession')
        });
        
        toast.success('Login successful!');
        
        // Navigate to admin page with replace to prevent back navigation to login
        setTimeout(() => {
          navigate('/admin', { replace: true });
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error setting session data:", error);
        toast.error("Failed to create session. Please try again.");
        setIsLoading(false);
      }
    } else {
      toast.error('Invalid credentials. Please check username and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
      
      {/* Wallet login option */}
      {!showTraditionalLogin && (
        <div className="space-y-4">
          <Button
            onClick={handleWalletLogin}
            className="w-full bg-wybe-primary hover:bg-wybe-primary/90 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Wallet size={18} />
            {isLoading ? 'Connecting...' : 'Login with Wallet'}
          </Button>
          
          <div className="relative flex items-center justify-center">
            <div className="border-t border-wybe-primary/20 flex-grow"></div>
            <div className="px-3 text-xs text-wybe-primary/60">OR</div>
            <div className="border-t border-wybe-primary/20 flex-grow"></div>
          </div>
          
          <Button
            onClick={() => setShowTraditionalLogin(true)} 
            variant="outline"
            className="w-full text-sm"
          >
            Use Username & Password
          </Button>
        </div>
      )}
      
      {/* Traditional login form */}
      {showTraditionalLogin && (
        <form onSubmit={handleTraditionalSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your username"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <div className="text-right text-sm">
              <AdminPasswordReset />
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Button
            type="button"
            onClick={() => setShowTraditionalLogin(false)}
            variant="ghost"
            className="w-full text-sm"
          >
            Back to Wallet Login
          </Button>
          
          <p className="text-sm text-center text-gray-400 mt-4">
            Demo credentials: <br />
            Username: <span className="text-white font-mono">admin</span> <br />
            Password: <span className="text-white font-mono">password</span>
          </p>
        </form>
      )}
    </div>
  );
};

export default AdminLoginForm;
