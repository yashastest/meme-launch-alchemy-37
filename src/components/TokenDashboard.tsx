
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkle, ArrowUp, ArrowDown, RefreshCw, DollarSign, Users, BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import wybeTokenService from "@/services/wybeTokenService";
import mongoDbService from "@/services/mongoDbService";

// Token Dashboard shows trading UI and token information
const TokenDashboard: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { wallet, connect, connected } = useWallet();
  
  const [token, setToken] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  
  // Trade state
  const [amount, setAmount] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);
  
  // Load token data
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        
        if (!tokenId) {
          toast.error("Token ID is missing");
          navigate("/");
          return;
        }
        
        // Get token from MongoDB
        const tokens = await mongoDbService.getTokens({ address: tokenId });
        
        if (tokens && tokens.length > 0) {
          const tokenData = tokens[0];
          setToken(tokenData);
          
          // Fetch market data
          const marketInfo = await wybeTokenService.getTokenMarketData(tokenId);
          if (marketInfo.success) {
            setMarketData(marketInfo.data);
          }
        } else {
          toast.error("Token not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        toast.error("Failed to load token data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokenData();
  }, [tokenId, navigate]);
  
  // Refresh market data
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      const marketInfo = await wybeTokenService.getTokenMarketData(tokenId!);
      if (marketInfo.success) {
        setMarketData(marketInfo.data);
        toast.success("Market data updated");
      } else {
        toast.error("Failed to update market data");
      }
    } catch (error) {
      console.error("Error refreshing market data:", error);
      toast.error("Failed to refresh market data");
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle buy action
  const handleBuy = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await wybeTokenService.buyTokens({
        tokenAddress: tokenId!,
        amount,
        walletAddress: wallet!
      });
      
      if (result.success) {
        toast.success(result.message);
        // Refresh market data after successful purchase
        handleRefresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Buy error:", error);
      toast.error("Failed to buy tokens");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle sell action
  const handleSell = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await wybeTokenService.sellTokens({
        tokenAddress: tokenId!,
        amount,
        walletAddress: wallet!
      });
      
      if (result.success) {
        toast.success(result.message);
        // Refresh market data after successful sale
        handleRefresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Sell error:", error);
      toast.error("Failed to sell tokens");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wybe-primary"></div>
      </div>
    );
  }
  
  // Token not found
  if (!token) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Token Not Found</h2>
        <p className="mb-6">The token you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Token Header */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <Avatar className="w-16 h-16 border-2 border-wybe-primary/20">
            <AvatarImage src={token.logo || "/placeholder.svg"} alt={token.name} />
            <AvatarFallback className="bg-wybe-primary/10 text-wybe-primary text-xl">
              {token.symbol?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{token.name}</h1>
              <span className="text-sm font-medium bg-wybe-primary/10 text-wybe-primary px-2 py-1 rounded">
                {token.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm truncate max-w-xs">{token.address}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(token.address);
                  toast.success("Token address copied to clipboard");
                }}
                className="text-xs hover:text-wybe-primary"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="relative"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Market Stats */}
          <div className="md:col-span-2 space-y-6">
            {marketData ? (
              <>
                {/* Price Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Price</span>
                      <div className={`flex items-center gap-1 ${marketData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {marketData.priceChange24h >= 0 ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        <span>{Math.abs(marketData.priceChange24h).toFixed(2)}%</span>
                      </div>
                    </CardTitle>
                    <CardDescription>Current price in SOL</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{marketData.price.toFixed(6)} SOL</div>
                  </CardContent>
                </Card>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Market Cap */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Market Cap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold">${marketData.marketCap.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  
                  {/* 24h Volume */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        24h Volume
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold">${marketData.volume24h.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  
                  {/* Holders */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Holders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold">{marketData.holders.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Price Chart would go here */}
                <Card className="h-[300px] flex items-center justify-center">
                  <CardContent className="w-full h-full flex flex-col items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-center text-muted-foreground">
                      Price chart integration with Birdeye/DexScreener coming soon
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Market Data</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                  <p className="text-center text-muted-foreground">
                    Market data is not available for this token yet.
                  </p>
                  <Button onClick={handleRefresh} variant="outline" className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" /> Try Refresh
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Trading Interface */}
          <div>
            <Card className="bg-black/40 border-wybe-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-wybe-primary" />
                  Trade {token.symbol}
                </CardTitle>
                <CardDescription>
                  Buy or sell tokens using the bonding curve
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connected ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="buy">Buy</TabsTrigger>
                      <TabsTrigger value="sell">Sell</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="buy">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Amount to Buy
                          </label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Enter amount"
                            min="1"
                          />
                        </div>
                        
                        {marketData && (
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span>Price</span>
                              <span>{marketData.price.toFixed(6)} SOL</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Total Cost</span>
                              <span>{(marketData.price * amount).toFixed(6)} SOL</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Fee (5%)</span>
                              <span>{(marketData.price * amount * 0.05).toFixed(6)} SOL</span>
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full" 
                          onClick={handleBuy}
                          disabled={submitting}
                        >
                          {submitting ? "Processing..." : "Buy Tokens"}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sell">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Amount to Sell
                          </label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Enter amount"
                            min="1"
                          />
                        </div>
                        
                        {marketData && (
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span>Price</span>
                              <span>{(marketData.price * 0.9).toFixed(6)} SOL</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Total Proceeds</span>
                              <span>{(marketData.price * 0.9 * amount).toFixed(6)} SOL</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Fee (5%)</span>
                              <span>{(marketData.price * 0.9 * amount * 0.05).toFixed(6)} SOL</span>
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full" 
                          onClick={handleSell}
                          variant="secondary"
                          disabled={submitting}
                        >
                          {submitting ? "Processing..." : "Sell Tokens"}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">
                      Connect your wallet to trade {token.symbol}
                    </p>
                    <Button onClick={handleConnect}>
                      Connect Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t border-wybe-primary/10 pt-4">
                <p>
                  Trading enabled by Wybe smart contract with automatic fee distribution
                </p>
              </CardFooter>
            </Card>
            
            {/* Token Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="truncate max-w-[200px]">{token.ownerWallet}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Launch Date</span>
                  <span>{new Date(token.launchDate || token.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trading Fee</span>
                  <span>5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${token.launchStatus === 'live' ? 'bg-green-500/20 text-green-500' : 
                      token.launchStatus === 'upcoming' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-red-500/20 text-red-500'}
                  `}>
                    {token.launchStatus}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TokenDashboard;
