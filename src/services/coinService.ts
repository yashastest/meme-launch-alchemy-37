
import { toast } from 'sonner';

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  category: string[];
}

export interface TrendingCoin {
  name: string;
  symbol: string;
  price: string;
  change: string;
  volume: string;
  marketCap: string;
  positive: boolean;
  sparkline: number[];
  holderStats: {
    whales: number;
    devs: number;
    retail: number;
  };
}

// Helper function to format coin data from CoinGecko
const formatCoinGeckoData = (data: any[]): TokenData[] => {
  try {
    return data.map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      logo: coin.image,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap || 0,
      volume24h: coin.total_volume || 0,
      category: determineCategory(coin.id, coin.name),
    }));
  } catch (error) {
    console.error('Error formatting CoinGecko data:', error);
    return [];
  }
};

// Helper to determine category tags for coins
const determineCategory = (id: string, name: string): string[] => {
  const categories: string[] = ['Meme'];
  
  // Add categories based on name or id
  const nameLower = name.toLowerCase();
  const idLower = id.toLowerCase();
  
  if (nameLower.includes('dog') || idLower.includes('dog') || 
      nameLower.includes('shib') || idLower.includes('shib') || 
      nameLower.includes('doge') || idLower.includes('doge') ||
      nameLower.includes('floki') || idLower.includes('floki') ||
      nameLower.includes('bonk') || idLower.includes('bonk')) {
    categories.push('Dog');
  }
  
  if (nameLower.includes('pepe') || idLower.includes('pepe') || 
      nameLower.includes('frog') || idLower.includes('frog')) {
    categories.push('Frog');
  }
  
  if (nameLower.includes('sol') || idLower.includes('sol')) {
    categories.push('Solana');
  }
  
  return categories;
};

// Format trending coin data for the trending section
export const formatTrendingCoins = (tokensData: TokenData[]): TrendingCoin[] => {
  return tokensData.slice(0, 4).map(token => ({
    name: token.name,
    symbol: token.symbol,
    price: token.price < 0.01 ? token.price.toFixed(6) : token.price.toFixed(2),
    change: `${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(1)}%`,
    volume: `$${formatNumber(token.volume24h)}`,
    marketCap: `$${formatNumber(token.marketCap)}`,
    positive: token.change24h >= 0,
    // Generate a somewhat realistic looking sparkline based on the change
    sparkline: generateSparkline(token.change24h),
    holderStats: {
      // Generate some realistic looking holder stats
      whales: Math.floor(token.marketCap / 10000000) + Math.floor(Math.random() * 10),
      devs: Math.max(1, Math.floor(Math.random() * 5)),
      retail: Math.floor(token.marketCap / 100000) + Math.floor(Math.random() * 1000),
    },
  }));
};

// Helper to generate sparkline data
const generateSparkline = (change24h: number): number[] => {
  const trend = change24h >= 0 ? 1 : -1;
  const volatility = Math.abs(change24h) / 5;
  const baseValue = 30;
  
  return Array(10).fill(0).map((_, i) => {
    // Create a somewhat realistic trend based on the 24h change
    const progress = i / 9; // 0 to 1
    const trendValue = baseValue + (trend * progress * Math.abs(change24h) / 2);
    const noise = (Math.random() - 0.5) * volatility * 2;
    return Math.max(10, trendValue + noise);
  });
};

// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toString();
};

// Fetch trending meme coins from CoinGecko
export const fetchTrendingMemeCoins = async (): Promise<TokenData[]> => {
  try {
    // API endpoint for meme coins on CoinGecko
    // You might need to get an API key for production use
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=100&page=1&sparkline=false'
    );
    
    if (!response.ok) {
      // If rate limited, throw error
      if (response.status === 429) {
        throw new Error('Rate limited by CoinGecko API. Please try again later.');
      }
      throw new Error('Failed to fetch coin data');
    }
    
    const data = await response.json();
    return formatCoinGeckoData(data);
  } catch (error) {
    console.error('Error fetching meme coins:', error);
    toast.error('Failed to fetch coin data. Using fallback data.');
    return getFallbackTokenData();
  }
};

// Fallback token data in case API fails
export const getFallbackTokenData = (): TokenData[] => {
  return [
    {
      id: "pepe",
      name: "Pepe",
      symbol: "PEPE",
      logo: "/coins/pepe.png",
      price: 0.00000123,
      change24h: 5.67,
      marketCap: 420000000,
      volume24h: 69000000,
      category: ["Meme", "Frog"],
    },
    {
      id: "doge",
      name: "Dogecoin",
      symbol: "DOGE",
      logo: "/coins/doge.png",
      price: 0.123,
      change24h: -2.34,
      marketCap: 16000000000,
      volume24h: 980000000,
      category: ["Meme", "Dog"],
    },
    {
      id: "shib",
      name: "Shiba Inu",
      symbol: "SHIB",
      logo: "/coins/shib.png",
      price: 0.00002345,
      change24h: 7.89,
      marketCap: 13500000000,
      volume24h: 850000000,
      category: ["Meme", "Dog"],
    },
    {
      id: "floki",
      name: "Floki",
      symbol: "FLOKI",
      logo: "/coins/floki.png",
      price: 0.0001234,
      change24h: 12.34,
      marketCap: 1200000000,
      volume24h: 320000000,
      category: ["Meme", "Dog"],
    },
    {
      id: "bonk",
      name: "Bonk",
      symbol: "BONK",
      logo: "/coins/bonk.png",
      price: 0.00000234,
      change24h: -3.45,
      marketCap: 950000000,
      volume24h: 210000000,
      category: ["Meme", "Dog", "Solana"],
    },
    {
      id: "wojak",
      name: "Wojak",
      symbol: "WOJAK",
      logo: "/coins/wojak.png",
      price: 0.0000789,
      change24h: 9.87,
      marketCap: 320000000,
      volume24h: 78000000,
      category: ["Meme", "Feels"],
    },
  ];
};

export default {
  fetchTrendingMemeCoins,
  formatTrendingCoins
};
