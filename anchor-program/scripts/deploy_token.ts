
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey, Connection, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import fs from 'fs';

// Import the IDL (Interface Description Language)
const idl = require('../target/idl/wybe_token_program.json');

// Configure environmental variables
require('dotenv').config();

// Program ID from Anchor.toml or env
const programId = new PublicKey(process.env.PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// Treasury wallet (platform fee recipient)
const TREASURY_WALLET = new PublicKey(process.env.TREASURY_WALLET || 'TREASURY_WALLET_PUBLIC_KEY');

async function main() {
  console.log('Starting token deployment...');
  
  // Connect to the Solana network (devnet by default)
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const endpoint = process.env.RPC_ENDPOINT || 
                   (network === 'devnet' ? 'https://api.devnet.solana.com' : 
                    network === 'testnet' ? 'https://api.testnet.solana.com' :
                    'https://api.mainnet-beta.solana.com');
  
  const connection = new Connection(endpoint, 'confirmed');
  console.log(`Connected to ${network} at ${endpoint}`);

  // Get token parameters from command line or use defaults
  const name = process.argv[2] || 'Wybe Test Token';
  const symbol = process.argv[3] || 'WYB';
  const decimals = parseInt(process.argv[4] || '9');
  const totalSupply = BigInt(process.argv[5] || '1000000000');
  
  // Parse creator keypair
  let creatorKeypair: Keypair;
  
  if (process.env.CREATOR_PRIVATE_KEY) {
    // Use private key from .env file
    const privateKeyBuffer = Buffer.from(process.env.CREATOR_PRIVATE_KEY, 'base64');
    creatorKeypair = Keypair.fromSecretKey(privateKeyBuffer);
  } else if (fs.existsSync('./id.json')) {
    // Use keypair from local file
    const keypairData = JSON.parse(fs.readFileSync('./id.json', 'utf-8'));
    creatorKeypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  } else {
    // Generate a new keypair for testing
    creatorKeypair = Keypair.generate();
    console.log('Generated new creator keypair for testing');
  }
  
  console.log(`Creator public key: ${creatorKeypair.publicKey.toString()}`);
  
  // Configure wallet and provider
  const wallet = new anchor.Wallet(creatorKeypair);
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { skipPreflight: false, commitment: 'confirmed' }
  );
  anchor.setProvider(provider);
  
  // Initialize program
  const program = new Program(idl, programId, provider);
  
  try {
    console.log(`Creating token: ${name} (${symbol})`);
    
    // Create the token mint 
    const tokenMint = await createMint(
      connection,
      creatorKeypair,
      creatorKeypair.publicKey,
      null,
      decimals,
      Keypair.generate(),
      undefined,
      TOKEN_PROGRAM_ID
    );
    
    console.log(`Token mint created: ${tokenMint.toBase58()}`);
    
    // Create token data account
    const tokenData = Keypair.generate();
    console.log(`Token data account: ${tokenData.publicKey.toBase58()}`);
    
    // Create the token account for the creator
    const creatorTokenAccount = await createAssociatedTokenAccount(
      connection,
      creatorKeypair,
      tokenMint,
      creatorKeypair.publicKey,
      undefined,
      TOKEN_PROGRAM_ID
    );
    
    console.log(`Creator token account: ${creatorTokenAccount.toBase58()}`);
    
    // Initialize token data
    await program.methods
      .initialize(
        name,
        symbol,
        decimals,
        new anchor.BN(totalSupply.toString())
      )
      .accounts({
        tokenData: tokenData.publicKey,
        mint: tokenMint,
        creator: creatorKeypair.publicKey,
        creatorFeeAccount: creatorKeypair.publicKey,
        platformFeeAccount: TREASURY_WALLET,
        systemProgram: SystemProgram.programId,
      })
      .signers([tokenData])
      .rpc();
    
    console.log('Token data initialized successfully');
    
    // Mint initial supply to creator
    await mintTo(
      connection,
      creatorKeypair,
      tokenMint,
      creatorTokenAccount,
      creatorKeypair,
      BigInt(totalSupply.toString()),
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );
    
    console.log(`Minted ${totalSupply.toString()} tokens to creator`);
    
    // Return token information
    const tokenInfo = {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      tokenAddress: tokenMint.toBase58(),
      tokenDataAddress: tokenData.publicKey.toBase58(),
      creatorAddress: creatorKeypair.publicKey.toBase58(),
      creatorTokenAccount: creatorTokenAccount.toBase58(),
      network,
      deploymentTime: new Date().toISOString()
    };
    
    console.log('\nToken Deployment Summary:');
    console.log(JSON.stringify(tokenInfo, null, 2));
    
    // Save token info to file
    fs.writeFileSync(
      `./token-${tokenMint.toBase58().slice(0, 8)}.json`,
      JSON.stringify(tokenInfo, null, 2)
    );
    
    console.log(`\nToken info saved to ./token-${tokenMint.toBase58().slice(0, 8)}.json`);
    console.log(`\nToken ${name} (${symbol}) deployed successfully!`);
    
    return tokenInfo;
    
  } catch (error) {
    console.error('Error deploying token:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
