
#!/bin/bash

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "Anchor is not installed. Please install it first."
    echo "Follow instructions at https://www.anchor-lang.com/docs/installation"
    exit 1
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "Solana CLI is not installed. Please install it first."
    echo "Follow instructions at https://docs.solanalabs.com/cli/install"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    echo "Loading configuration from .env"
    source .env
else
    echo "No .env file found. Using default configuration."
    # Default values
    SOLANA_NETWORK=${SOLANA_NETWORK:-devnet}
fi

# Set Solana config to the specified network
echo "Setting Solana configuration to $SOLANA_NETWORK..."
solana config set --url $SOLANA_NETWORK

# Check if keypair exists, if not create one
if [ ! -f id.json ]; then
    echo "Creating new keypair..."
    solana-keygen new -o id.json --force
    KEYPAIR_PATH=$(pwd)/id.json
    solana config set --keypair $KEYPAIR_PATH
    
    if [ "$SOLANA_NETWORK" = "devnet" ] || [ "$SOLANA_NETWORK" = "testnet" ]; then
        echo "Airdropping 2 SOL to your new wallet..."
        solana airdrop 2
    fi
fi

# Build and deploy the program
echo "Building Anchor program..."
anchor build

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/wybe_token_program-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Update Anchor.toml with the program ID
echo "Updating Anchor.toml with program ID..."
sed -i.bak "s/^wybe_token_program = \".*\"/wybe_token_program = \"$PROGRAM_ID\"/" Anchor.toml
rm Anchor.toml.bak

# Update the declare_id! macro in lib.rs
echo "Updating program ID in lib.rs..."
sed -i.bak "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PROGRAM_ID\")/" programs/wybe_token_program/src/lib.rs
rm programs/wybe_token_program/src/lib.rs.bak

# Deploy the program
echo "Deploying program to $SOLANA_NETWORK..."
anchor deploy

# Output deployment information
echo ""
echo "Deployment Summary"
echo "=================="
echo "Program ID: $PROGRAM_ID"
echo "Network: $SOLANA_NETWORK"
echo "Anchor Version: $(anchor --version)"
echo "Solana Version: $(solana --version)"
echo ""
echo "To deploy a token, run:"
echo "node scripts/deploy_token.js \"Token Name\" \"SYMBOL\" 9 1000000000"
