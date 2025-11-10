const { Connection, PublicKey } = require("@solana/web3.js");
const { struct, u8 } = require("@solana/buffer-layout");
const { publicKey: publicKeyLayout, u64: u64Layout, u128: u128Layout } = require("@solana/buffer-layout-utils");

// ========== CONFIGURATION ==========

// 0xRoulette protocol program ID
const PROGRAM_ID = "Rou1svrgkcuo1rBNkP1XaESrD9xRpukx2uLY5MsgK14";

// RPC endpoint - DeFi Llama will provide their own when running
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// ========== DATA STRUCTURES ==========

// VaultAccount structure matching the on-chain program
const VAULT_ACCOUNT_LAYOUT = struct([
  publicKeyLayout("tokenMint"),
  publicKeyLayout("tokenAccount"),
  u64Layout("totalLiquidity"),
  u64Layout("totalProviderCapital"),
  u8("bump"),
  u64Layout("ownerReward"),
  u128Layout("rewardPerShareIndex"),
]);

// VaultAccount size: 120 bytes (actual on-chain size with padding)
const VAULT_ACCOUNT_SIZE = 120;

/**
 * Real VaultAccount discriminator from on-chain data
 * Discriminator: e6fbf1538bca5d1c (hex)
 */
function getVaultDiscriminator() {
  // Real discriminator found on-chain
  return Buffer.from('e6fbf1538bca5d1c', 'hex');
}

// ========== HELPER FUNCTIONS ==========

/**
 * Fetches mint decimals for proper balance display
 */
async function getMintDecimals(connection, mintAddress) {
  try {
    const mintInfo = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    if (mintInfo.value && mintInfo.value.data.parsed) {
      return mintInfo.value.data.parsed.info.decimals;
    }
  } catch (error) {
    console.error(`Error fetching mint decimals for ${mintAddress}:`, error.message);
  }
  return 6; // Default decimals for most Solana tokens (USDC, USDT)
}

/**
 * Fetches all vault accounts from the program using getProgramAccounts
 */
async function getAllVaults(connection) {
  try {
    const expectedDiscriminator = getVaultDiscriminator();
    
    // Get all accounts with the correct size, then filter by discriminator manually
    const accounts = await connection.getProgramAccounts(
      new PublicKey(PROGRAM_ID),
      {
        filters: [
          {
            dataSize: VAULT_ACCOUNT_SIZE, // Filter by size only
          },
        ],
      }
    );

    console.log(`[getAllVaults] Found ${accounts.length} accounts with size ${VAULT_ACCOUNT_SIZE}`);
    
    const vaults = [];
    for (const account of accounts) {
      try {
        // Check discriminator manually
        const accountDiscriminator = account.account.data.slice(0, 8);
        if (!accountDiscriminator.equals(expectedDiscriminator)) {
          console.log(`[getAllVaults] Skipping account ${account.pubkey.toString()} - discriminator mismatch`);
          continue;
        }
        
        // Skip 8-byte Anchor discriminator
        const data = account.account.data.slice(8);
        const decoded = VAULT_ACCOUNT_LAYOUT.decode(data);
        
        vaults.push({
          address: account.pubkey.toString(),
          tokenMint: decoded.tokenMint.toString(),
          tokenAccount: decoded.tokenAccount.toString(),
          totalLiquidity: decoded.totalLiquidity.toString(),
          totalProviderCapital: decoded.totalProviderCapital.toString(),
        });
      } catch (error) {
        console.error(`Error decoding vault ${account.pubkey.toString()}:`, error.message);
      }
    }
    
    console.log(`[getAllVaults] After filtering: ${vaults.length} vault accounts`);
    return vaults;
  } catch (error) {
    console.error("Error fetching vaults:", error.message);
    return [];
  }
}

/**
 * Alternative method: Try to derive vault PDAs from known token mints
 * This can be used if getProgramAccounts doesn't work well
 */
async function getVaultByTokenMint(connection, tokenMint) {
  try {
    const [vaultPda] = await PublicKey.findProgramAddress(
      [Buffer.from("vault"), new PublicKey(tokenMint).toBuffer()],
      new PublicKey(PROGRAM_ID)
    );
    
    const accountInfo = await connection.getAccountInfo(vaultPda);
    if (!accountInfo || accountInfo.data.length !== VAULT_ACCOUNT_SIZE) {
      return null;
    }
    
    const data = accountInfo.data.slice(8);
    const decoded = VAULT_ACCOUNT_LAYOUT.decode(data);
    
    return {
      address: vaultPda.toString(),
      tokenMint: decoded.tokenMint.toString(),
      tokenAccount: decoded.tokenAccount.toString(),
      totalLiquidity: decoded.totalLiquidity.toString(),
      totalProviderCapital: decoded.totalProviderCapital.toString(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Debug function to check all program accounts
 * Useful for troubleshooting when no vaults are found
 */
async function debugProgramAccounts() {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  
  console.log("=== DEBUG: Checking program accounts ===\n");
  
  try {
    // 1. Check if program exists
    const programInfo = await connection.getAccountInfo(new PublicKey(PROGRAM_ID));
    console.log(`Program exists: ${programInfo !== null}`);
    if (programInfo) {
      console.log(`Program owner: ${programInfo.owner.toString()}`);
      console.log(`Program executable: ${programInfo.executable}\n`);
    } else {
      console.log("ERROR: Program not found! Check if you're on the right network.\n");
      return;
    }
    
    // 2. Calculate and show discriminator
    const discriminator = getVaultDiscriminator();
    console.log(`VaultAccount discriminator (hex): ${discriminator.toString('hex')}`);
    console.log(`VaultAccount discriminator (base64): ${discriminator.toString('base64')}\n`);
    
    // 3. Get ALL program accounts (no filters)
    console.log("Fetching ALL program accounts (no filters)...");
    const allAccounts = await connection.getProgramAccounts(
      new PublicKey(PROGRAM_ID)
    );
    
    console.log(`Total program accounts: ${allAccounts.length}\n`);
    
    if (allAccounts.length === 0) {
      console.log("No accounts found. The program might not have any initialized accounts yet.");
      return;
    }
    
    // 4. Group by size and show discriminators
    const sizeGroups = {};
    const discriminatorGroups = {};
    
    for (const account of allAccounts) {
      const size = account.account.data.length;
      const disc = account.account.data.slice(0, 8).toString('hex');
      
      if (!sizeGroups[size]) {
        sizeGroups[size] = [];
      }
      sizeGroups[size].push(account.pubkey.toString());
      
      if (!discriminatorGroups[disc]) {
        discriminatorGroups[disc] = { count: 0, size: size, accounts: [] };
      }
      discriminatorGroups[disc].count++;
      if (discriminatorGroups[disc].accounts.length < 3) {
        discriminatorGroups[disc].accounts.push(account.pubkey.toString());
      }
    }
    
    console.log("Accounts grouped by size:");
    for (const [size, accounts] of Object.entries(sizeGroups)) {
      console.log(`  Size ${size}: ${accounts.length} accounts`);
      if (accounts.length <= 3) {
        accounts.forEach(addr => console.log(`    - ${addr}`));
      }
    }
    
    console.log("\nAccounts grouped by discriminator:");
    for (const [disc, info] of Object.entries(discriminatorGroups)) {
      console.log(`  Discriminator ${disc}:`);
      console.log(`    Count: ${info.count}`);
      console.log(`    Size: ${info.size}`);
      if (info.accounts.length > 0) {
        console.log(`    Examples:`);
        info.accounts.forEach(addr => console.log(`      - ${addr}`));
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
}

// ========== MAIN TVL FUNCTION ==========

/**
 * Calculates Total Value Locked (TVL)
 * Called by DeFi Llama to retrieve protocol liquidity data
 * 
 * @param {number} timestamp - Unix timestamp (not used for Solana)
 * @param {number} ethBlock - Ethereum block number (not used for Solana)
 * @param {object} chainBlocks - Block numbers for different chains (not used)
 * @returns {object} Token balances in format { "solana:MINT_ADDRESS": amount }
 */
async function tvl(timestamp, ethBlock, chainBlocks) {
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  const balances = {};

  try {
    // 1. Fetch all program vaults
    const vaults = await getAllVaults(connection);
    
    if (vaults.length === 0) {
      console.log("[TVL] No vaults found");
      return balances;
    }

    // 2. Process each vault
    for (const vault of vaults) {
      try {
        const tokenMint = vault.tokenMint;
        
        // Get decimals for proper display
        const decimals = await getMintDecimals(connection, tokenMint);
        
        // Convert raw amount to human-readable format
        const liquidityAmount = Number(vault.totalLiquidity) / Math.pow(10, decimals);
        
        // DeFi Llama format: "solana:MINT_ADDRESS"
        const key = `solana:${tokenMint}`;
        
        // Sum if vault with this token already exists
        if (balances[key]) {
          balances[key] += liquidityAmount;
        } else {
          balances[key] = liquidityAmount;
        }
        
        console.log(`[TVL] Vault ${vault.address.slice(0, 8)}... | Token: ${tokenMint.slice(0, 8)}... | Liquidity: ${liquidityAmount.toFixed(2)}`);
      } catch (error) {
        console.error(`Error processing vault ${vault.address}:`, error.message);
        // Continue processing other vaults
      }
    }

    console.log(`[TVL] Total tokens: ${Object.keys(balances).length}`);
    
  } catch (error) {
    console.error("Critical error in TVL calculation:", error);
  }

  return balances;
}

// ========== DEFI LLAMA EXPORT ==========

module.exports = {
  timetravel: false, // Solana doesn't support historical queries via standard RPC
  misrepresentedTokens: false,
  methodology: 
    "TVL is calculated by automatically discovering all 0xRoulette protocol vaults " +
    "via getProgramAccounts and summing the total_liquidity field in each vault. " +
    "Each vault holds liquidity in a single SPL token. " +
    "Vaults are created by liquidity providers through the initialize_and_provide_liquidity instruction.",
  solana: {
    tvl,
  },
};

// ========== LOCAL TESTING ==========

if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    // Run debug mode if --debug flag is passed
    if (args.includes('--debug')) {
      await debugProgramAccounts();
      return;
    }
    
    console.log("=========================================");
    console.log("  0xRoulette DeFi Llama Adapter Test");
    console.log("=========================================\n");
    
    console.log("Configuration:");
    console.log(`  Program ID: ${PROGRAM_ID}`);
    console.log(`  RPC Endpoint: ${RPC_ENDPOINT}\n`);
    
    console.log("Calculating TVL...\n");
    
    const startTime = Date.now();
    const result = await tvl();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log("\n=========================================");
    console.log("Results:");
    console.log("=========================================\n");
    console.log(JSON.stringify(result, null, 2));
    console.log(`\nExecution time: ${duration}s`);
    console.log(`Total vaults: ${Object.keys(result).length}`);
    
    // Calculate total liquidity per token
    console.log("\nTVL Summary:");
    for (const [token, amount] of Object.entries(result)) {
      const mint = token.replace('solana:', '');
      console.log(`  ${mint}: ${amount.toFixed(2)}`);
    }
    
    console.log("\nTip: Run 'node index.js --debug' to see all program accounts");
  })();
}