const bs58 = require('bs58');

// ========== CONFIGURATION ==========
const PROGRAM_ID = "Rou1svrgkcuo1rBNkP1XaESrD9xRpukx2uLY5MsgK14";
const VAULT_ACCOUNT_SIZE = 120;
const VAULT_DISCRIMINATOR = Buffer.from('e6fbf1538bca5d1c', 'hex');

// ========== MANUAL DECODING FUNCTIONS ==========
// We manually decode the VaultAccount structure to avoid complex dependencies
// VaultAccount structure (after 8-byte discriminator):
// - tokenMint: Pubkey (32 bytes)
// - tokenAccount: Pubkey (32 bytes)
// - totalLiquidity: u64 (8 bytes)
// - totalProviderCapital: u64 (8 bytes)
// - bump: u8 (1 byte)
// - ownerReward: u64 (8 bytes)
// - rewardPerShareIndex: u128 (16 bytes)

function decodeVaultAccount(data) {
  let offset = 0;
  
  // tokenMint (32 bytes)
  const tokenMint = data.slice(offset, offset + 32);
  offset += 32;
  
  // tokenAccount (32 bytes) - skip it
  offset += 32;
  
  // totalLiquidity (8 bytes, u64, little-endian)
  const totalLiquidity = data.readBigUInt64LE(offset);
  offset += 8;
  
  return {
    tokenMint: (bs58.default || bs58).encode(tokenMint),
    totalLiquidity: totalLiquidity.toString(),
  };
}

/**
 * Main TVL function for the DeFi Llama SDK
 */
async function tvl(_, _2, _3, { api }) {
  const accounts = await api.getProgramAccounts({
    programId: PROGRAM_ID,
    filters: [{ dataSize: VAULT_ACCOUNT_SIZE }],
  });

  for (const account of accounts) {
    // Check if this is a VaultAccount by comparing the discriminator
    if (account.account.data.slice(0, 8).equals(VAULT_DISCRIMINATOR)) {
      try {
        const decoded = decodeVaultAccount(account.account.data.slice(8));
        api.add(decoded.tokenMint, decoded.totalLiquidity);
      } catch (e) {
        console.error(`Failed to decode vault:`, e.message);
      }
    }
  }
}

// ========== DEFI LLAMA EXPORT ==========
module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "TVL is calculated by fetching all on-chain accounts for the 0xRoulette program using the DeFi Llama SDK. " +
    "It filters for vaults by account size (120 bytes) and the correct on-chain discriminator. " +
    "The raw 'total_liquidity' balance for each vault's SPL token is then summed up. " +
    "The SDK automatically converts these raw balances to their USD equivalent.",
  solana: {
    tvl,
  },
};

// ========== LOCAL TESTING ==========
// This section is only for local testing and is not used by DeFi Llama
if (require.main === module) {
  const { Connection } = require('@solana/web3.js');
  
  async function localTest() {
    console.log("=========================================");
    console.log("  0xRoulette LOCAL TEST");
    console.log("=========================================\n");
    
    const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    
    console.log(`Fetching program accounts for: ${PROGRAM_ID}`);
    console.log(`Expected size: ${VAULT_ACCOUNT_SIZE} bytes\n`);
    
    const accounts = await connection.getProgramAccounts(
      new (require('@solana/web3.js').PublicKey)(PROGRAM_ID),
      { filters: [{ dataSize: VAULT_ACCOUNT_SIZE }] }
    );
    
    console.log(`Found ${accounts.length} accounts with size ${VAULT_ACCOUNT_SIZE}`);
    
    let vaultCount = 0;
    const balances = {};
    
    for (const account of accounts) {
      if (account.account.data.slice(0, 8).equals(VAULT_DISCRIMINATOR)) {
        vaultCount++;
        try {
          const decoded = decodeVaultAccount(account.account.data.slice(8));
          console.log(`\nVault #${vaultCount}:`);
          console.log(`  Token Mint: ${decoded.tokenMint}`);
          console.log(`  Total Liquidity (raw): ${decoded.totalLiquidity}`);
          
          balances[decoded.tokenMint] = (balances[decoded.tokenMint] || BigInt(0)) + BigInt(decoded.totalLiquidity);
        } catch (e) {
          console.error(`  Error decoding vault: ${e.message}`);
        }
      }
    }
    
    console.log(`\n=========================================`);
    console.log(`Total vaults found: ${vaultCount}`);
    console.log(`=========================================\n`);
    console.log("Aggregated balances by token:");
    for (const [mint, balance] of Object.entries(balances)) {
      console.log(`  ${mint}: ${balance.toString()}`);
    }
  }
  
  localTest().catch(console.error);
}
