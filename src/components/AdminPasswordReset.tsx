
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast'; // Update the import
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('wybefun@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // This would typically be an API call to your backend
      // For demo purposes, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password reset link sent to your email');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-wybe-background-light border-wybe-primary/20">
        <DialogHeader>
          <DialogTitle>Reset Admin Password</DialogTitle>
          <DialogDescription>
            Enter your email address to receive a password reset link.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="bg-wybe-background/40 border-wybe-primary/20"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-400">
              The reset link will be sent to the specified email address.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordReset;
