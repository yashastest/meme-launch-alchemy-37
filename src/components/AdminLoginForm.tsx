
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast"; 
import { EyeIcon, EyeOffIcon } from "lucide-react";
import AdminPasswordReset from "./AdminPasswordReset";
import mongoDbService from '@/services/mongoDbService';

const AdminLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the real MongoDB service to validate credentials
      const adminUser = await mongoDbService.validateAdminCredentials(username, password);
      
      if (adminUser) {
        console.log("Credentials valid, setting session data");
        
        // Create session data with permissions
        const sessionData = {
          username: adminUser.username,
          permissions: adminUser.permissions,
          loginTime: Date.now(),
          expiryTime: Date.now() + (12 * 60 * 60 * 1000), // 12 hour expiry
        };
        
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
        }, 500);
      } else {
        toast.error('Invalid credentials. Please check username and password.');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
      
      {/* Traditional login form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-wybe-primary hover:bg-wybe-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Logging in</span>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            </>
          ) : "Login"}
        </Button>
      </form>
      
      {/* Password reset option */}
      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-wybe-secondary hover:underline text-sm"
          onClick={() => {
            // For now, just show a toast message
            toast.info("Please contact the system administrator to reset your password.");
          }}
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
};

export default AdminLoginForm;
