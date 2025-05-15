
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Run auth check when component loads
  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    setIsLoading(true);
    
    try {
      // Check for existing session
      const isLoggedIn = localStorage.getItem("wybeAdminLoggedIn") === "true";
      const sessionData = sessionStorage.getItem("wybeAdminSession");
      const sessionExists = !!sessionData;
      
      console.log("Auth check:", { isLoggedIn, sessionExists, path: location.pathname });
      
      if (isLoggedIn && sessionExists) {
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
