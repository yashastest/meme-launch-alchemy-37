import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import { useNavigate } from "react-router-dom";
import wybeTokenService, { TokenDeploymentConfig } from "@/services/wybeTokenService";

interface TokenCreationFormProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TokenCreationForm: React.FC<TokenCreationFormProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { wallet, connect, connected } = useWallet();
  
  // Form state
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [curveStyle, setCurveStyle] = useState("classic");
  const [website, setWebsite] = useState("");
  const [telegramChannel, setTelegramChannel] = useState("");
  const [description, setDescription] = useState("");
  const [whitelistEmail, setWhitelistEmail] = useState("");
  const [whitelistTelegram, setWhitelistTelegram] = useState("");
  const [whitelistDescription, setWhitelistDescription] = useState("");
  
  // State for submission
  const [whitelistRequestSent, setWhitelistRequestSent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [deployedToken, setDeployedToken] = useState<any>(null);
  
  // Image upload states
  const [tokenLogo, setTokenLogo] = useState<File | null>(null);
  const [tokenLogoPreview, setTokenLogoPreview] = useState<string | null>(null);
  const [tokenBanner, setTokenBanner] = useState<File | null>(null);
  const [tokenBannerPreview, setTokenBannerPreview] = useState<string | null>(null);
  
  const handleConnect = async () => {
    try {
      await connect();
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet");
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTokenLogo(file);
      setTokenLogoPreview(URL.createObjectURL(file));
      toast.success("Logo uploaded successfully!");
    }
  };
  
  const handleRemoveLogo = () => {
    if (tokenLogoPreview) {
      URL.revokeObjectURL(tokenLogoPreview);
    }
    setTokenLogo(null);
    setTokenLogoPreview(null);
  };
  
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTokenBanner(file);
      setTokenBannerPreview(URL.createObjectURL(file));
      toast.success("Banner uploaded successfully!");
    }
  };
  
  const handleRemoveBanner = () => {
    if (tokenBannerPreview) {
      URL.revokeObjectURL(tokenBannerPreview);
    }
    setTokenBanner(null);
    setTokenBannerPreview(null);
  };
  
  const handleSubmitWhitelistRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!whitelistEmail || !whitelistTelegram || !whitelistDescription) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Submit whitelist request
    toast.success("Processing whitelist request...");
    
    // Simulate submission
    setTimeout(() => {
      setWhitelistRequestSent(true);
      toast.success("Whitelist request submitted successfully!");
    }, 1500);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!name || !symbol) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate symbol length
    if (symbol.length > 5) {
      toast.error("Symbol should be 5 characters or less");
      return;
    }
    
    setIsCreating(true);
    
    try {
      toast.success("Creating your token...", { duration: 5000 });
      
      // Prepare token deployment config
      const tokenConfig: TokenDeploymentConfig = {
        name,
        symbol: symbol.toUpperCase(),
        initialSupply: 1000000000, // 1 billion tokens
        creatorWallet: wallet!,
        description,
        website,
        telegram: telegramChannel,
      };
      
      // Call token deployment service
      const result = await wybeTokenService.deployToken(tokenConfig);
      
      if (result.success && result.tokenAddress) {
        setDeployedToken({
          name,
          symbol: symbol.toUpperCase(),
          address: result.tokenAddress,
          creator: wallet,
          ...result.data
        });
        setShowDialog(true);
      } else {
        toast.error(result.message || "Failed to deploy token");
      }
    } catch (error) {
      console.error("Token creation error:", error);
      toast.error("Error creating token. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleCopyAddress = () => {
    if (deployedToken?.address) {
      navigator.clipboard.writeText(deployedToken.address);
      toast.success("Token address copied to clipboard");
    }
  };
  
  const handleStartTrading = () => {
    setShowDialog(false);
    if (deployedToken?.address) {
      navigate(`/token/${deployedToken.address}`);
    } else {
      navigate("/trade");
    }
  };
  
  if (activeTab === "assisted") {
    return (
      <>
        {whitelistRequestSent ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-medium mb-2">Request Submitted!</h3>
            <p className="text-gray-300 mb-4">
              We'll review your request and contact you soon. Once approved, you'll be able to launch your coin.
            </p>
            <Button 
              variant="outline" 
              className="btn-secondary"
              onClick={() => setWhitelistRequestSent(false)}
            >
              Submit Another Request
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitWhitelistRequest} className="space-y-4">
            <div>
              <Label htmlFor="whitelistEmail">Your Email</Label>
              <Input 
                id="whitelistEmail" 
                value={whitelistEmail} 
                onChange={(e) => setWhitelistEmail(e.target.value)}
                placeholder="your@email.com" 
                className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="whitelistTelegram">Telegram Username</Label>
              <Input 
                id="whitelistTelegram" 
                value={whitelistTelegram} 
                onChange={(e) => setWhitelistTelegram(e.target.value)}
                placeholder="@username" 
                className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
                required
              />
            </div>
            
            <div>
              <Label>Token Logo (Optional)</Label>
              <ImageUpload
                id="assistedTokenLogo"
                label="Logo"
                imagePreview={tokenLogoPreview}
                onImageUpload={handleLogoUpload}
                onImageRemove={handleRemoveLogo}
                className="mb-2"
                imageClassName="w-24 h-24 rounded-full"
              />
            </div>
            
            <div>
              <Label>Token Banner (Optional)</Label>
              <ImageUpload
                id="assistedTokenBanner"
                label="Banner"
                imagePreview={tokenBannerPreview}
                onImageUpload={handleBannerUpload}
                onImageRemove={handleRemoveBanner}
                aspectRatio={3/1}
                className="mb-2"
                imageClassName="w-full h-auto rounded-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input 
                id="website" 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com" 
                className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
              />
            </div>
            
            <div>
              <Label htmlFor="telegramChannel">Telegram Channel (Optional)</Label>
              <Input 
                id="telegramChannel" 
                value={telegramChannel} 
                onChange={(e) => setTelegramChannel(e.target.value)}
                placeholder="https://t.me/yourchannel" 
                className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
              />
            </div>
            
            <div>
              <Label htmlFor="whitelistDescription">Project Description</Label>
              <Textarea
                id="whitelistDescription" 
                value={whitelistDescription} 
                onChange={(e) => setWhitelistDescription(e.target.value)}
                placeholder="Tell us about your meme coin idea" 
                className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary min-h-[80px]"
                required
              />
            </div>
            
            <div className="bg-wybe-primary/10 border border-wybe-primary/20 rounded-lg p-3 mt-4">
              <p className="text-sm flex items-center gap-2">
                <Shield size={16} className="text-wybe-secondary" />
                <span>Assisted launch requires whitelist approval</span>
              </p>
            </div>
            
            <Button type="submit" className="btn-primary w-full animate-pulse-glow">
              Submit Whitelist Request
            </Button>
          </form>
        )}
      </>
    );
  }
  
  // Direct launch form
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Token Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Doge Coin" 
              className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input 
              id="symbol" 
              value={symbol} 
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. DOGE" 
              className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
              maxLength={5}
              required
            />
          </div>
          
          <div>
            <Label>Token Logo (Optional)</Label>
            <ImageUpload
              id="logo"
              label="Logo"
              imagePreview={tokenLogoPreview}
              onImageUpload={handleLogoUpload}
              onImageRemove={handleRemoveLogo}
              className="mb-2"
              imageClassName="w-24 h-24 rounded-full"
            />
          </div>
          
          <div>
            <Label>Token Banner (Optional)</Label>
            <ImageUpload
              id="banner"
              label="Banner"
              imagePreview={tokenBannerPreview}
              onImageUpload={handleBannerUpload}
              onImageRemove={handleRemoveBanner}
              aspectRatio={3/1}
              className="mb-2"
              imageClassName="w-full h-auto rounded-lg"
            />
            <p className="text-xs text-gray-400 text-center mt-1">
              Recommended: 1500×500px banner image
            </p>
          </div>
          
          <div>
            <Label htmlFor="curve">Bonding Curve Style</Label>
            <Select value={curveStyle} onValueChange={setCurveStyle}>
              <SelectTrigger className="bg-wybe-background-light border-wybe-primary/20 focus:ring-wybe-primary">
                <SelectValue placeholder="Select curve style" />
              </SelectTrigger>
              <SelectContent className="bg-wybe-background-light border-white/10">
                <SelectItem value="classic">Classic (Linear)</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="sigmoid">Sigmoid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Social Links (Optional)</Label>
            <Input 
              placeholder="Website URL" 
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
            />
            
            <Input 
              placeholder="Telegram Channel" 
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
              className="bg-wybe-background-light border-wybe-primary/20 focus-visible:ring-wybe-primary"
            />
          </div>
          
          <div className="bg-wybe-primary/10 border border-wybe-primary/20 rounded-lg p-3 mt-4">
            <p className="text-sm flex items-center gap-2">
              <AlertTriangle size={16} className="text-wybe-secondary" />
              <span>Creation fee: ~$1 USDT (paid in SOL)</span>
            </p>
          </div>
          
          <Button type="submit" className="btn-primary w-full animate-pulse-glow" disabled={isCreating}>
            {isCreating ? (
              <>
                <span className="animate-pulse">Creating...</span>
                <div className="ml-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              </>
            ) : "Launch Coin"}
          </Button>
        </div>
      </form>
      
      {/* Success Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-wybe-background-light border-wybe-primary/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              Token Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your meme coin has been deployed to the Solana blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-wybe-background/70 rounded-lg p-4 border border-white/10">
              <div className="flex items-center mb-4">
                {tokenLogoPreview ? (
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border border-white/10">
                    <img 
                      src={tokenLogoPreview} 
                      alt={deployedToken?.name || "Token"} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-wybe-primary/20 flex items-center justify-center mr-4">
                    <Rocket className="text-wybe-primary" size={20} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{deployedToken?.name || "Token"}</h3>
                  <p className="text-sm text-gray-400">{deployedToken?.symbol || "WYBE"}</p>
                </div>
              </div>
              
              {tokenBannerPreview && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={tokenBannerPreview} 
                    alt={`${deployedToken?.name || "Token"} Banner`} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Total Supply:</span>
                <span className="font-medium">1,000,000,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Token Address:</span>
                {deployedToken?.address ? (
                  <button 
                    onClick={handleCopyAddress} 
                    className="text-xs bg-wybe-primary/20 hover:bg-wybe-primary/30 text-wybe-primary px-2 py-1 rounded-md transition-colors"
                  >
                    {deployedToken.address.slice(0, 8)}...{deployedToken.address.slice(-4)} (Copy)
                  </button>
                ) : (
                  <span className="text-xs">Unknown</span>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="btn-secondary flex-1">
              View on Solscan
            </Button>
            <Button onClick={handleStartTrading} className="btn-primary flex-1 animate-pulse-glow">
              Start Trading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TokenCreationForm;
