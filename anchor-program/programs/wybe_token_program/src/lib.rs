
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod wybe_token_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        token_data.name = name;
        token_data.symbol = symbol;
        token_data.decimals = decimals;
        token_data.mint = ctx.accounts.mint.key();
        token_data.authority = ctx.accounts.authority.key();
        token_data.created_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
    
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        // Check that the authority is the token_data authority
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_data.authority,
            WybeTokenError::Unauthorized
        );
        
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;
        
        Ok(())
    }
    
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = token::Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;
        
        Ok(())
    }
    
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Apply fee if configured
        if ctx.accounts.token_data.fee_basis_points > 0 {
            let fee_amount = (amount as u128)
                .checked_mul(ctx.accounts.token_data.fee_basis_points as u128)
                .unwrap()
                .checked_div(10000)
                .unwrap() as u64;
            
            if fee_amount > 0 {
                let fee_cpi_accounts = token::Transfer {
                    from: ctx.accounts.from.to_account_info(),
                    to: ctx.accounts.fee_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                };
                
                let fee_cpi_ctx = CpiContext::new(cpi_program, fee_cpi_accounts);
                token::transfer(fee_cpi_ctx, fee_amount)?;
            }
        }
        
        Ok(())
    }
    
    pub fn update_fee(
        ctx: Context<UpdateFee>,
        fee_basis_points: u16,
    ) -> Result<()> {
        // Check that the authority is the token_data authority
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_data.authority,
            WybeTokenError::Unauthorized
        );
        
        // Check that the fee is not too high
        require!(
            fee_basis_points <= 1000, // Max 10%
            WybeTokenError::FeeTooHigh
        );
        
        ctx.accounts.token_data.fee_basis_points = fee_basis_points;
        
        Ok(())
    }
    
    pub fn update_fee_account(
        ctx: Context<UpdateFeeAccount>,
        fee_account: Pubkey,
    ) -> Result<()> {
        // Check that the authority is the token_data authority
        require!(
            ctx.accounts.authority.key() == ctx.accounts.token_data.authority,
            WybeTokenError::Unauthorized
        );
        
        ctx.accounts.token_data.fee_account = fee_account;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + // discriminator
               32 + // mint
               4 + 32 + // name (string)
               4 + 32 + // symbol (string)
               1 + // decimals
               32 + // authority
               8 + // created_at
               2 + // fee_basis_points
               32 // fee_account
    )]
    pub token_data: Account<'info, TokenData>,
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub token_data: Account<'info, TokenData>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub fee_account: Account<'info, TokenAccount>,
    pub token_data: Account<'info, TokenData>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateFeeAccount<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    pub authority: Signer<'info>,
}

#[account]
pub struct TokenData {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub authority: Pubkey,
    pub created_at: i64,
    pub fee_basis_points: u16,
    pub fee_account: Pubkey,
}

#[error_code]
pub enum WybeTokenError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Fee is too high")]
    FeeTooHigh,
}
