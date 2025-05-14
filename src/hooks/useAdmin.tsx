
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useWallet } from './useWallet';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, isAdmin } = useWallet();

  // Run auth check when wallet status changes
  useEffect(() => {
    checkAdminSession();
  }, [connected, isAdmin]);

  const checkAdminSession = async () => {
    setIsLoading(true);
    
    try {
      // If wallet is connected and is an admin wallet, consider them authenticated
      if (connected && isAdmin) {
        console.log("Admin wallet detected, setting authenticated to true");
        setIsAuthenticated(true);
        setAdminPermissions(['all']); // Admin wallet gets all permissions
        
        // Store session in sessionStorage (still used for non-wallet auth flows)
        const sessionData = {
          walletAuth: true,
          permissions: ['all'],
          loginTime: Date.now(),
          expiryTime: Date.now() + (12 * 60 * 60 * 1000), // 12 hour expiry
        };
        
        localStorage.setItem('wybeAdminLoggedIn', 'true');
        sessionStorage.setItem('wybeAdminSession', JSON.stringify(sessionData));
      } else {
        // If not using wallet auth, check for existing session
        const isLoggedIn = localStorage.getItem("wybeAdminLoggedIn") === "true";
        const sessionData = sessionStorage.getItem("wybeAdminSession");
        const sessionExists = !!sessionData;
        
        console.log("Auth check:", { isLoggedIn, sessionExists, isWalletAdmin: isAdmin, path: location.pathname });
        
        if (isLoggedIn && sessionExists) {
          try {
            // Load permissions from session
            const parsedSession = JSON.parse(sessionData || '{}');
            const permissions = parsedSession.permissions || ['default'];
            setAdminPermissions(permissions);
            
            // Check if session has expired
            const expiryTime = parsedSession.expiryTime;
            if (expiryTime && new Date().getTime() > expiryTime) {
              console.log("Session expired, logging out");
              await logout();
              return;
            }
            
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error parsing session data:", error);
            setAdminPermissions(['default']);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
          
          // Only redirect if we're on an admin page that requires authentication
          // and not already on the login page
          if (location.pathname.startsWith('/admin') && 
              !location.pathname.includes('/admin-login') &&
              !authCheckCompleted) { // Only redirect on first check
            console.log("Redirecting to login page");
            navigate('/admin-login', { replace: true });
            toast.error("Authentication required. Please login.");
          }
        }
      }
    } finally {
      setIsLoading(false);
      setAuthCheckCompleted(true);
    }
  };

  const logout = async () => {
    localStorage.removeItem("wybeAdminLoggedIn");
    sessionStorage.removeItem("wybeAdminSession");
    setIsAuthenticated(false);
    setAuthCheckCompleted(true);
    navigate('/admin-login', { replace: true });
    toast.success("Logged out successfully", {
      duration: 3000,
    });
  };

  const hasPermission = (requiredPermission: string): boolean => {
    // Super admin has all permissions
    if (adminPermissions.includes('all')) return true;
    
    // Check if user has the specific permission
    return adminPermissions.includes(requiredPermission);
  };

  return { 
    isAuthenticated, 
    isLoading, 
    logout, 
    checkAdminSession,
    adminPermissions,
    hasPermission,
    authCheckCompleted
  };
};

export default useAdmin;
