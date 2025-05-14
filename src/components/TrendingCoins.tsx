
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Rocket, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTrendingMemeCoins, formatTrendingCoins, TrendingCoin } from "@/services/coinService";

const TrendingCoins = () => {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchTrendingMemeCoins();
        const formattedData = formatTrendingCoins(data);
        setTrendingCoins(formattedData);
      } catch (error) {
        console.error("Error loading trending coins:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoins();
    
    // Refresh data every 60 seconds
    const interval = setInterval(loadCoins, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {loading ? (
        // Loading skeletons
        Array(4).fill(0).map((_, index) => (
          <div key={index} className="glass-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            
            <Skeleton className="mb-4 h-16 w-full rounded-xl" />
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            
            <Skeleton className="mb-4 h-16 rounded-xl" />
            
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))
      ) : (
        trendingCoins.map((coin, index) => (
          <TrendingCoinCard key={index} coin={coin} delay={index * 0.1} />
        ))
      )}
    </div>
  );
};

const TrendingCoinCard = ({ coin, delay }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: delay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="glass-card p-5 hover:border-wybe-primary/30 hover:shadow-glow-sm transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold">{coin.name}</h3>
          <p className="text-sm text-gray-400">{coin.symbol}</p>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-sm ${
            coin.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {coin.positive ? 
            <TrendingUp size={14} className="mr-1" /> : 
            <TrendingDown size={14} className="mr-1" />
          }
          {coin.change}
        </div>
      </div>
      
      <div className="mb-4 h-16 rounded-xl overflow-hidden bg-black/20">
        <Sparkline data={coin.sparkline} positive={coin.positive} />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-black/20 rounded-xl p-2">
          <p className="text-xs text-gray-400">💰 Price</p>
          <p className="font-medium">{coin.price} SOL</p>
        </div>
        <div className="bg-black/20 rounded-xl p-2">
          <p className="text-xs text-gray-400">📊 Volume</p>
          <p className="font-medium">{coin.volume}</p>
        </div>
      </div>
      
      {/* Holder statistics with icons */}
      <div className="mb-4 bg-wybe-background-light/30 rounded-xl p-2">
        <p className="text-xs text-gray-300 mb-1 flex items-center gap-1">
          <Users size={12} className="text-wybe-primary" />
          Holder Stats
        </p>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-black/30 rounded-lg p-1">
            <p className="text-[10px] text-gray-400">🐋 Whales</p>
            <p className="font-medium text-xs">{coin.holderStats.whales}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-1">
            <p className="text-[10px] text-gray-400">👨‍💻 Devs</p>
            <p className="font-medium text-xs">{coin.holderStats.devs}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-1">
            <p className="text-[10px] text-gray-400">👤 Retail</p>
            <p className="font-medium text-xs">{coin.holderStats.retail}</p>
          </div>
        </div>
      </div>
      
      <Link to={`/trade/${coin.symbol.toLowerCase()}`}>
        <Button className="w-full btn-primary text-sm py-1 h-8 flex items-center justify-center gap-1 group">
          <span>Trade {coin.symbol}</span>
          <Rocket size={14} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </motion.div>
  );
};

const Sparkline = ({ data, positive }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <linearGradient id={`gradient-${positive}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity="0.2" />
          <stop offset="100%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
        
        <polygon 
          points={`0,100 ${points} 100,100`} 
          fill={`url(#gradient-${positive})`}
        />
        
        <polyline
          points={points}
          fill="none"
          stroke={positive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default TrendingCoins;
