
import { 
  deployToken as anchorDeployToken,
  buyTokens as anchorBuyTokens,
  sellTokens as anchorSellTokens,
  claimCreatorRewards as anchorClaimRewards
} from '../../anchor-program/scripts/token-deploy';
import { toast } from '@/hooks/use-toast';
import mongoDbService from '@/services/mongoDbService';

// Deploy a new token using Anchor program
export async function deployToken(tokenData: {
  name: string;
  symbol: string;
  initialSupply: number;
  creatorWallet: string;
  description?: string;
  website?: string;
  telegram?: string;
}) {
  try {
    // Log deployment start
    console.log('Starting token deployment:', tokenData);
    
    // For development environment, we'll just use mock implementation
    // In production, this would call the actual Anchor program
    const result = await anchorDeployToken(tokenData);
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error during token deployment');
    }
    
    // Save token to MongoDB
    await mongoDbService.createToken({
      symbol: tokenData.symbol,
      name: tokenData.name,
      address: result.tokenAddress,
      ownerWallet: tokenData.creatorWallet,
      launchStatus: 'live',
      // Set some initial market data
      marketCap: 10000, // Initial mock market cap
      volume24h: 500, // Initial mock volume
      launchDate: new Date(),
    });
    
    toast.success(`Token ${tokenData.name} deployed successfully!`);
    return result;
  } catch (error) {
    console.error('Token deployment error:', error);
    toast.error(`Failed to deploy token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Buy tokens using Anchor program
export async function buyTokens(config: {
  tokenAddress: string;
  amount: number;
  walletAddress: string;
  slippage?: number;
}) {
  try {
    // Log buy start
    console.log('Starting token purchase:', config);
    
    // For development environment, we'll just use mock implementation
    // In production, this would call the actual Anchor program
    const result = await anchorBuyTokens(config);
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error during token purchase');
    }
    
    toast.success(`Successfully purchased ${config.amount} tokens`);
    return result;
  } catch (error) {
    console.error('Token purchase error:', error);
    toast.error(`Failed to buy tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Sell tokens using Anchor program
export async function sellTokens(config: {
  tokenAddress: string;
  amount: number;
  walletAddress: string;
  slippage?: number;
}) {
  try {
    // Log sell start
    console.log('Starting token sale:', config);
    
    // For development environment, we'll just use mock implementation
    // In production, this would call the actual Anchor program
    const result = await anchorSellTokens(config);
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error during token sale');
    }
    
    toast.success(`Successfully sold ${config.amount} tokens`);
    return result;
  } catch (error) {
    console.error('Token sale error:', error);
    toast.error(`Failed to sell tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Claim creator rewards for a token
export async function claimCreatorRewards(tokenAddress: string, creatorWallet: string) {
  try {
    // Log claim start
    console.log('Starting reward claim:', { tokenAddress, creatorWallet });
    
    // For development environment, we'll just use mock implementation
    // In production, this would call the actual Anchor program
    const result = await anchorClaimRewards(tokenAddress, creatorWallet);
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error during reward claim');
    }
    
    toast.success(`Successfully claimed creator rewards: ${result.rewardsAmount?.toFixed(4)} SOL`);
    return result;
  } catch (error) {
    console.error('Reward claim error:', error);
    toast.error(`Failed to claim rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// Check if a wallet is eligible to create tokens (admin approval)
export async function isWalletApprovedForTokenCreation(walletAddress: string): Promise<boolean> {
  try {
    // In a real app, this would check against an approved list in MongoDB
    const admins = await mongoDbService.getAdminByUsername('admin'); // Temporary - would check wallet specifically
    
    // For demo purposes, allow any wallet to create tokens
    return true;
  } catch (error) {
    console.error('Approval check error:', error);
    return false;
  }
}

export default {
  deployToken,
  buyTokens,
  sellTokens,
  claimCreatorRewards,
  isWalletApprovedForTokenCreation,
};
