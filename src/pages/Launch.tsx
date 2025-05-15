
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { Link } from "react-router-dom";
import { Shimmer } from "@/components/ui/shimmer";
import { useIsMobile } from "@/hooks/use-mobile";
import TokenCreationForm from "@/components/TokenCreationForm";

const Launch = () => {
  const { wallet, connect } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("assisted");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Simulate loading state
    setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    if (wallet) {
      setIsWalletConnected(true);
    }
  }, [wallet]);
  
  const handleConnect = async () => {
    try {
      await connect();
      setIsWalletConnected(true);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Header />
      
      {/* Launch Page Content */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-40 right-20 w-96 h-96 bg-wybe-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-wybe-accent/10 rounded-full blur-3xl" />
        
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-6 md:p-8 w-full max-w-md"
            >
              <div className="flex flex-col items-center">
                <Shimmer className="w-16 h-16 rounded-full mb-4" />
                <Shimmer className="h-8 w-48 mb-2" rounded="lg" />
                <Shimmer className="h-4 w-64 mb-6" rounded="lg" />
                
                <div className="w-full mb-6">
                  <Shimmer className="h-16 w-full mb-6" rounded="lg" />
                </div>
                
                <Shimmer className="h-10 w-full" rounded="lg" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="w-full max-w-md mx-auto"
              key="content"
            >
              <div className="glass-card p-6 md:p-8">
                <motion.div variants={itemVariants} className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-wybe-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Coins className="text-wybe-primary animate-pulse" size={24} />
                  </div>
                  <h1 className="text-2xl font-bold gradient-text">Launch Your Meme Coin</h1>
                  <p className="text-gray-400 mt-2">Create and deploy your token in seconds</p>
                </motion.div>
                
                {/* Package Banner - Updated with better contrast and theme-matching */}
                <div className="mb-6 p-4 glass-card bg-black/70 border border-orange-500/30 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium enhanced-text-visibility">Need full launch support?</h3>
                      <p className="text-xs text-gray-300">All-in $500 package with marketing and support</p>
                    </div>
                    <Link to="/package">
                      <Button size="sm" variant="orange" className="text-xs flex items-center gap-1">
                        Learn More
                        <ChevronRight size={12} />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {!isWalletConnected ? (
                  <motion.div variants={itemVariants} className="text-center">
                    <p className="text-gray-300 mb-4">Connect your wallet to launch your coin</p>
                    <Button onClick={handleConnect} className="btn-primary w-full animate-pulse-glow">
                      Connect Wallet
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div variants={itemVariants}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                      <TabsList className="grid grid-cols-2 mb-4 w-full">
                        <TabsTrigger value="assisted" className="text-sm">
                          Assisted Launch
                        </TabsTrigger>
                        <TabsTrigger value="direct" className="text-sm">
                          Direct Launch
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="assisted">
                        <TokenCreationForm activeTab={activeTab} setActiveTab={setActiveTab} />
                      </TabsContent>
                      
                      <TabsContent value="direct">
                        <TokenCreationForm activeTab={activeTab} setActiveTab={setActiveTab} />
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Footer />
    </div>
  );
};

export default Launch;
