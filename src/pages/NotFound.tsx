
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-black")}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-400 mb-4">Oops! Page not found</p>
        <a href="/" className="text-orange-500 hover:text-orange-400 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
