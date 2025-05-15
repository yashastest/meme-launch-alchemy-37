
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use solana_program::clock::Clock;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod wybe_token_program {
    use super::*;

    // Initialize new token with metadata
    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: u64,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        token_data.name = name;
        token_data.symbol = symbol;
        token_data.decimals = decimals;
        token_data.mint = ctx.accounts.mint.key();
        token_data.creator = ctx.accounts.creator.key();
        token_data.total_supply = total_supply;
        token_data.market_cap = 0;
        token_data.created_at = Clock::get()?.unix_timestamp;
        token_data.creator_fee_basis_points = 200; // 2% creator fee (40% of 5%)
        token_data.platform_fee_basis_points = 300; // 3% platform fee (60% of 5%)
        token_data.creator_fee_account = ctx.accounts.creator_fee_account.key();
        token_data.platform_fee_account = ctx.accounts.platform_fee_account.key();
        token_data.min_market_cap_for_fees = 50000; // $50,000 minimum market cap
        token_data.min_time_for_fees = 48 * 60 * 60; // 48 hours in seconds
        token_data.rewards_cooldown = 7 * 24 * 60 * 60; // 7 days in seconds
        token_data.last_reward_claim = 0;
        token_data.collected_creator_fees = 0;
        
        Ok(())
    }
    
    // Mint tokens to an account
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Check that the creator is the token_data creator
        require!(
            ctx.accounts.creator.key() == ctx.accounts.token_data.creator,
            WybeTokenError::Unauthorized
        );
        
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.creator.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;
        
        Ok(())
    }
    
    // Buy tokens using SOL (bonding curve or fixed price)
    pub fn buy_tokens(
        ctx: Context<TradeTokens>,
        amount: u64,
        max_price: u64,
    ) -> Result<()> {
        // Calculate price based on amount and current supply
        let price_per_token = calculate_buy_price(
            ctx.accounts.token_data.total_supply,
            amount
        );
        
        let total_cost = price_per_token.checked_mul(amount)
            .ok_or(WybeTokenError::MathOverflow)?;
            
        // Check if the price is acceptable to the buyer
        require!(
            total_cost <= max_price,
            WybeTokenError::PriceExceedsMaximum
        );
        
        // Transfer SOL from buyer to the pool
        // In a real implementation, this would use the SOL transfer CPI
        // Placeholder for illustration
        
        // Transfer tokens to the buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.pool_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Calculate and distribute fees
        if should_collect_fees(&ctx.accounts.token_data) {
            let total_fee_amount = calculate_fee_amount(total_cost);
            let creator_fee = total_fee_amount
                .checked_mul(ctx.accounts.token_data.creator_fee_basis_points as u64)
                .ok_or(WybeTokenError::MathOverflow)?
                .checked_div(500) // Total basis points (2% + 3%)
                .ok_or(WybeTokenError::MathOverflow)?;
                
            let platform_fee = total_fee_amount
                .checked_mul(ctx.accounts.token_data.platform_fee_basis_points as u64)
                .ok_or(WybeTokenError::MathOverflow)?
                .checked_div(500) // Total basis points (2% + 3%)
                .ok_or(WybeTokenError::MathOverflow)?;
            
            // Update collected fees for creator
            ctx.accounts.token_data.collected_creator_fees = ctx.accounts.token_data.collected_creator_fees
                .checked_add(creator_fee)
                .ok_or(WybeTokenError::MathOverflow)?;
        }
        
        // Update market cap
        ctx.accounts.token_data.market_cap = calculate_market_cap(
            ctx.accounts.token_data.total_supply,
            price_per_token
        );
        
        Ok(())
    }
    
    // Sell tokens to receive SOL
    pub fn sell_tokens(
        ctx: Context<TradeTokens>,
        amount: u64,
        min_proceeds: u64,
    ) -> Result<()> {
        // Calculate proceeds based on amount and current supply
        let price_per_token = calculate_sell_price(
            ctx.accounts.token_data.total_supply,
            amount
        );
        
        let total_proceeds = price_per_token.checked_mul(amount)
            .ok_or(WybeTokenError::MathOverflow)?;
            
        // Check if the proceeds are acceptable to the seller
        require!(
            total_proceeds >= min_proceeds,
            WybeTokenError::ProceedsBelowMinimum
        );
        
        // Transfer tokens from seller to the pool
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.pool_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Transfer SOL to the seller (minus fees)
        // In a real implementation, this would use the SOL transfer CPI
        // Placeholder for illustration
        
        // Calculate and distribute fees
        if should_collect_fees(&ctx.accounts.token_data) {
            let total_fee_amount = calculate_fee_amount(total_proceeds);
            let creator_fee = total_fee_amount
                .checked_mul(ctx.accounts.token_data.creator_fee_basis_points as u64)
                .ok_or(WybeTokenError::MathOverflow)?
                .checked_div(500) // Total basis points (2% + 3%)
                .ok_or(WybeTokenError::MathOverflow)?;
                
            let platform_fee = total_fee_amount
                .checked_mul(ctx.accounts.token_data.platform_fee_basis_points as u64)
                .ok_or(WybeTokenError::MathOverflow)?
                .checked_div(500) // Total basis points (2% + 3%)
                .ok_or(WybeTokenError::MathOverflow)?;
            
            // Update collected fees for creator
            ctx.accounts.token_data.collected_creator_fees = ctx.accounts.token_data.collected_creator_fees
                .checked_add(creator_fee)
                .ok_or(WybeTokenError::MathOverflow)?;
        }
        
        // Update market cap
        ctx.accounts.token_data.market_cap = calculate_market_cap(
            ctx.accounts.token_data.total_supply,
            price_per_token
        );
        
        Ok(())
    }
    
    // Allow creators to claim their accumulated fees
    pub fn claim_creator_rewards(
        ctx: Context<ClaimRewards>
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        
        // Check that the caller is the creator
        require!(
            ctx.accounts.creator.key() == token_data.creator,
            WybeTokenError::Unauthorized
        );
        
        // Check if there are rewards to claim
        require!(
            token_data.collected_creator_fees > 0,
            WybeTokenError::NoRewardsToCollect
        );
        
        // Check if cooldown period has passed since last claim
        let current_time = Clock::get()?.unix_timestamp;
        if token_data.last_reward_claim > 0 {
            require!(
                current_time - token_data.last_reward_claim >= token_data.rewards_cooldown,
                WybeTokenError::RewardsOnCooldown
            );
        }
        
        // Check if market cap and time conditions are met
        require!(
            token_data.market_cap >= token_data.min_market_cap_for_fees,
            WybeTokenError::MarketCapTooLow
        );
        
        // In a real implementation, transfer SOL to creator
        // Placeholder for illustration
        let reward_amount = token_data.collected_creator_fees;
        
        // Update reward claim timestamp and reset collected fees
        token_data.last_reward_claim = current_time;
        token_data.collected_creator_fees = 0;
        
        Ok(())
    }
    
    // Update fee settings
    pub fn update_fee_settings(
        ctx: Context<UpdateFees>,
        creator_fee_basis_points: Option<u16>,
        platform_fee_basis_points: Option<u16>,
        min_market_cap: Option<u64>,
        min_time_for_fees: Option<i64>,
        rewards_cooldown: Option<i64>,
    ) -> Result<()> {
        // Only platform admin can update fee settings
        require!(
            ctx.accounts.admin.key() == ctx.accounts.token_data.platform_fee_account,
            WybeTokenError::Unauthorized
        );
        
        let token_data = &mut ctx.accounts.token_data;
        
        // Update fee basis points
        if let Some(creator_fee) = creator_fee_basis_points {
            require!(creator_fee <= 500, WybeTokenError::FeeTooHigh);
            token_data.creator_fee_basis_points = creator_fee;
        }
        
        if let Some(platform_fee) = platform_fee_basis_points {
            require!(platform_fee <= 500, WybeTokenError::FeeTooHigh);
            token_data.platform_fee_basis_points = platform_fee;
        }
        
        // Update market cap minimum
        if let Some(min_cap) = min_market_cap {
            token_data.min_market_cap_for_fees = min_cap;
        }
        
        // Update time minimum
        if let Some(min_time) = min_time_for_fees {
            token_data.min_time_for_fees = min_time;
        }
        
        // Update rewards cooldown
        if let Some(cooldown) = rewards_cooldown {
            token_data.rewards_cooldown = cooldown;
        }
        
        Ok(())
    }
}

// Utility function to calculate buy price (simple fixed price for now)
fn calculate_buy_price(current_supply: u64, amount: u64) -> u64 {
    // Fixed price implementation
    // In a real app, this would implement bonding curve math
    1_000_000 // 0.001 SOL per token (lamports)
}

// Utility function to calculate sell price (simple fixed price for now)
fn calculate_sell_price(current_supply: u64, amount: u64) -> u64 {
    // Fixed price implementation
    // In a real app, this would implement bonding curve math
    900_000 // 0.0009 SOL per token (lamports)
}

// Utility function to calculate market cap
fn calculate_market_cap(total_supply: u64, price_per_token: u64) -> u64 {
    // Simple calculation - may overflow for large supplies
    // In a real implementation, use checked math
    total_supply.saturating_mul(price_per_token)
}

// Utility function to calculate fee amount (5% total)
fn calculate_fee_amount(amount: u64) -> u64 {
    // 5% fee
    amount.saturating_mul(5).saturating_div(100)
}

// Utility function to determine if fees should be collected
fn should_collect_fees(token_data: &TokenData) -> bool {
    // Check if market cap is high enough
    if token_data.market_cap < token_data.min_market_cap_for_fees {
        return false;
    }
    
    // In a full implementation, check if the token has existed for min_time_for_fees
    // We'd need to store launch timestamp and check against current time
    
    true
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = creator,
        space = TokenData::SPACE
    )]
    pub token_data: Account<'info, TokenData>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub creator_fee_account: AccountInfo<'info>,
    pub platform_fee_account: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TradeTokens<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub pool_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub pool_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    pub admin: Signer<'info>,
}

#[account]
pub struct TokenData {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub creator: Pubkey,
    pub total_supply: u64,
    pub market_cap: u64,
    pub created_at: i64,
    pub creator_fee_basis_points: u16,
    pub platform_fee_basis_points: u16,
    pub creator_fee_account: Pubkey,
    pub platform_fee_account: Pubkey,
    pub min_market_cap_for_fees: u64,
    pub min_time_for_fees: i64,
    pub rewards_cooldown: i64,
    pub last_reward_claim: i64,
    pub collected_creator_fees: u64,
}

impl TokenData {
    pub const SPACE: usize = 8 + // discriminator
        32 + // mint
        4 + 32 + // name (string)
        4 + 10 + // symbol (string)
        1 + // decimals
        32 + // creator
        8 + // total_supply
        8 + // market_cap
        8 + // created_at
        2 + // creator_fee_basis_points
        2 + // platform_fee_basis_points
        32 + // creator_fee_account
        32 + // platform_fee_account
        8 + // min_market_cap_for_fees
        8 + // min_time_for_fees
        8 + // rewards_cooldown
        8 + // last_reward_claim
        8; // collected_creator_fees
}

#[error_code]
pub enum WybeTokenError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Fee is too high")]
    FeeTooHigh,
    #[msg("Arithmetic overflow/underflow")]
    MathOverflow,
    #[msg("Price exceeds maximum acceptable price")]
    PriceExceedsMaximum,
    #[msg("Proceeds below minimum acceptable amount")]
    ProceedsBelowMinimum,
    #[msg("No rewards to collect")]
    NoRewardsToCollect,
    #[msg("Rewards are on cooldown")]
    RewardsOnCooldown,
    #[msg("Market cap is too low to collect rewards")]
    MarketCapTooLow,
}
