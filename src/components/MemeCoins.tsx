
import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTrendingMemeCoins, TokenData } from "@/services/coinService";

const formatPrice = (price: number): string => {
  if (price < 0.00001) {
    return price.toFixed(8);
  } else if (price < 0.01) {
    return price.toFixed(6);
  } else if (price < 1) {
    return price.toFixed(4);
  } else {
    return price.toFixed(2);
  }
};

const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(2)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`;
  } else {
    return `$${(marketCap / 1000).toFixed(2)}K`;
  }
};

const MemeCoins: React.FC = () => {
  const [coins, setCoins] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCoins = async () => {
      try {
        setLoading(true);
        const data = await fetchTrendingMemeCoins();
        setCoins(data);
        setError(null);
      } catch (err) {
        setError("Failed to load meme coins data");
        console.error(err);
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
    <section id="memecoins" className="py-16 container">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gradient">Trending Meme Coins</h2>
          <p className="text-muted-foreground">
            Track the hottest meme coins in the crypto market
          </p>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="glass-card p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
            <p>{error}</p>
            <button 
              onClick={() => fetchTrendingMemeCoins().then(setCoins)}
              className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          // Coins grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coins.map((coin) => (
              <div
                key={coin.id}
                className="glass-card p-4 hover:shadow-glow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/40">
                    <AspectRatio ratio={1 / 1}>
                      <img
                        src={coin.logo || `/coins/${coin.id}.png`}
                        alt={coin.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a default logo if image fails to load
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </AspectRatio>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{coin.name}</h3>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-wybe-primary" />
                        <span className="text-xs text-muted-foreground">
                          Trending
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">
                        {coin.symbol}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          coin.change24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {coin.change24h >= 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(coin.change24h).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-medium">${formatPrice(coin.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Cap</p>
                      <p className="font-medium">
                        {formatMarketCap(coin.marketCap)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coin.category.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-wybe-primary/10 rounded-full text-xs text-wybe-primary"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MemeCoins;
