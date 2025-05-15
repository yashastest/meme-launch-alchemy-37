
/**
 * Smart contract code templates for the Wybe platform
 */

export const contractTemplates = {
  // Token program template
  tokenProgram: `// SPDX-License-Identifier: MIT
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("PROGRAM_ID_PLACEHOLDER");

#[program]
pub mod wybe_token {
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
        Ok(())
    }
    
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
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
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 32 + 4 + 32 + 1 + 8
    )]
    pub token_data: Account<'info, TokenData>,
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    pub mint: Account<'info, Mint>,
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    pub mint: Account<'info, Mint>,
    pub token_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    pub from: Account<'info, TokenAccount>,
    pub to: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenData {
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub authority: Pubkey,
}`,

  // Treasury program template
  treasuryProgram: `// SPDX-License-Identifier: MIT
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("PROGRAM_ID_PLACEHOLDER");

#[program]
pub mod creator_fee_treasury {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.total_fees_collected = 0;
        treasury.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn collect_fees(
        ctx: Context<CollectFees>,
        amount: u64
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_fees_collected = treasury.total_fees_collected.checked_add(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        Ok(())
    }
    
    pub fn withdraw_fees(
        ctx: Context<WithdrawFees>,
        amount: u64
    ) -> Result<()> {
        require!(ctx.accounts.authority.key() == ctx.accounts.treasury.authority, TreasuryError::Unauthorized);
        
        // Transfer SOL from the treasury account to the recipient
        let treasury_address = ctx.accounts.treasury.to_account_info().key();
        let recipient_address = ctx.accounts.recipient.key();
        let transfer_amount = amount;
        
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? -= transfer_amount;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += transfer_amount;
        
        // Update treasury data
        let treasury = &mut ctx.accounts.treasury;
        treasury.total_fees_collected = treasury.total_fees_collected.checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        Ok(())
    }
    
    pub fn update_authority(
        ctx: Context<UpdateAuthority>,
        new_authority: Pubkey
    ) -> Result<()> {
        require!(ctx.accounts.authority.key() == ctx.accounts.treasury.authority, TreasuryError::Unauthorized);
        
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = new_authority;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8
    )]
    pub treasury: Account<'info, Treasury>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub total_fees_collected: u64,
    pub created_at: i64,
}

#[error_code]
pub enum TreasuryError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,
}`
};

/**
 * Get contract template with program ID inserted
 */
export const getContractTemplate = (type: 'token' | 'treasury' | 'other', programId: string): string => {
  let template = '';
  
  switch(type) {
    case 'token':
      template = contractTemplates.tokenProgram;
      break;
    case 'treasury':
      template = contractTemplates.treasuryProgram;
      break;
    case 'other':
      template = '// Custom contract template\n// Program ID: ' + programId;
      break;
    default:
      template = '// No template available for this contract type';
  }
  
  return template.replace('PROGRAM_ID_PLACEHOLDER', programId);
};

export default contractTemplates;
