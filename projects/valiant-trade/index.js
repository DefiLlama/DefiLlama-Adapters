const { getProvider, getConnection, getTokenAccountBalances } = require("../helper/solana");
const { decodeAccount } = require("../helper/utils/solana/layout");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const sdk = require('@defillama/sdk');
const DEX_PROGRAM_ID = 'vnt1u7PzorND5JjweFWmDawKe2hLWoTwHU6QKz6XX98'

// Core tokens that have CoinGecko prices
const CORE_TOKENS = new Set([
  'So11111111111111111111111111111111111111112', // Native FOGO
  'uSd2czE61Evaf76RNbq4KPpXnkiL3irdzgLFUMe3NoG', // USDC
  'HLc5hqihQGFU68488j7HkdyF6rywyJfV46BN6Dn8W5ug', // wSOL
]);

// LST (Liquid Staking Token) configurations
// These tokens have exchange rates > 1 with underlying FOGO
const LST_CONFIGS = {
  // iFOGO from Ignition
  'iFoGoY5nMWpuMJogR7xjUAWDJtygHDF17zREeP4MKuD': {
    name: 'iFOGO',
    stakePool: 'ign1zuR3YsvLVsEu8WzsyazBA8EVWUxPPHKnhqhoSTB',
  },
  // stFOGO from Brasa
  'Brasa3xzkSC9XqMBEcN9v53x4oMkpb1nQwfaGMyJE88b': {
    name: 'stFOGO',
    stakePool: '4z6piA8DWGfbZge1xkwtkczpZEMsgReNh5AsCKZUQE9X',
  },
};

// Get exchange rate from a stake pool: totalLamports / poolTokenSupply
async function getStakePoolExchangeRate(connection, stakePoolAddress) {
  try {
    const pubkey = new PublicKey(stakePoolAddress);
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) return 1;

    const decoded = decodeAccount('stakePool', accountInfo);
    const totalLamports = Number(decoded.totalLamports);
    const poolTokenSupply = Number(decoded.poolTokenSupply);

    if (poolTokenSupply === 0) return 1;
    return totalLamports / poolTokenSupply;
  } catch (error) {
    // Some stake pools use non-standard layouts, fall back to 1:1
    return 1;
  }
}

// Convert sqrtPrice (Q64.64) to actual price
// sqrtPrice = sqrt(tokenB/tokenA) * 2^64
// price = (sqrtPrice / 2^64)^2
function sqrtPriceToPrice(sqrtPriceX64) {
  const sqrtPrice = Number(sqrtPriceX64) / (2 ** 64);
  return sqrtPrice * sqrtPrice;
}

async function tvl(api) {
  const provider = getProvider(api.chain);
  const connection = getConnection(api.chain);
  const program = new Program(idl, DEX_PROGRAM_ID, provider)

  // Fetch LST exchange rates
  const exchangeRates = {};
  for (const [mint, config] of Object.entries(LST_CONFIGS)) {
    if (config.stakePool) {
      exchangeRates[mint] = await getStakePoolExchangeRate(connection, config.stakePool);
    } else {
      exchangeRates[mint] = 1;
    }
  }

  const balances = {};

  try {
    const vortexAccounts = await program.account.vortex.all();

    // Get all vault addresses
    const allVaults = [];

    vortexAccounts.forEach(({ account }) => {
      if (account.tokenVaultA && account.tokenVaultB) {
        allVaults.push(account.tokenVaultA, account.tokenVaultB);
      }
    });

    // Fetch all vault balances in batch
    const vaultBalances = await getTokenAccountBalances(allVaults, { individual: true, allowError: true, chain: api.chain });

    // Process each pool - CLMM style (no doubling, use sqrtPrice for unknown tokens)
    let vaultIdx = 0;
    vortexAccounts.forEach(({ account }) => {
      const mintA = account.tokenMintA?.toString();
      const mintB = account.tokenMintB?.toString();
      const sqrtPrice = account.sqrtPrice;

      if (!account.tokenVaultA || !account.tokenVaultB) return;

      let balA = Number(vaultBalances[vaultIdx]?.amount || 0);
      let balB = Number(vaultBalances[vaultIdx + 1]?.amount || 0);
      vaultIdx += 2;

      // Handle LST tokens - convert to FOGO equivalent
      let tokenA = mintA;
      let tokenB = mintB;

      if (LST_CONFIGS[mintA]) {
        const rate = exchangeRates[mintA];
        tokenA = 'So11111111111111111111111111111111111111112'; // Native FOGO
        balA = balA * rate;
      }
      if (LST_CONFIGS[mintB]) {
        const rate = exchangeRates[mintB];
        tokenB = 'So11111111111111111111111111111111111111112'; // Native FOGO
        balB = balB * rate;
      }

      const isKnownA = CORE_TOKENS.has(tokenA);
      const isKnownB = CORE_TOKENS.has(tokenB);

      // CLMM TVL calculation:
      // - For known tokens: add actual balance
      // - For unknown tokens paired with known: use sqrtPrice to convert to known token value
      if (isKnownA && isKnownB) {
        // Both known - add both actual balances
        sdk.util.sumSingleBalance(balances, tokenA, balA);
        sdk.util.sumSingleBalance(balances, tokenB, balB);
      } else if (isKnownA && !isKnownB) {
        // A is known, B is unknown - add A, convert B using sqrtPrice
        sdk.util.sumSingleBalance(balances, tokenA, balA);
        // price = tokenB per tokenA, so balB in terms of A = balB / price
        const price = sqrtPriceToPrice(sqrtPrice);
        if (price > 0) {
          const balBInA = balB / price;
          sdk.util.sumSingleBalance(balances, tokenA, balBInA);
        }
      } else if (!isKnownA && isKnownB) {
        // B is known, A is unknown - add B, convert A using sqrtPrice
        sdk.util.sumSingleBalance(balances, tokenB, balB);
        // price = tokenB per tokenA, so balA in terms of B = balA * price
        const price = sqrtPriceToPrice(sqrtPrice);
        if (price > 0) {
          const balAInB = balA * price;
          sdk.util.sumSingleBalance(balances, tokenB, balAInB);
        }
      }
      // If both unknown, skip (can't price)
    });

  } catch (error) {
    // Pool query failed
  }

  // Convert raw balances to token amounts and return
  // USDC: 6 decimals, FOGO/SOL: 9 decimals
  const result = {};
  
  for (const [token, balance] of Object.entries(balances)) {
    if (token === 'uSd2czE61Evaf76RNbq4KPpXnkiL3irdzgLFUMe3NoG') {
      // USDC - 6 decimals
      result['coingecko:usd-coin'] = (result['coingecko:usd-coin'] || 0) + balance / 1e6;
    } else if (token === 'So11111111111111111111111111111111111111112') {
      // Native FOGO - 9 decimals
      result['coingecko:fogo'] = (result['coingecko:fogo'] || 0) + balance / 1e9;
    } else if (token === 'HLc5hqihQGFU68488j7HkdyF6rywyJfV46BN6Dn8W5ug') {
      // wSOL - 8 decimals
      result['coingecko:solana'] = (result['coingecko:solana'] || 0) + balance / 1e8;
    }
  }
  
  return result;
}

module.exports = {
  timetravel: false,
  fogo: {
    tvl,
  }
}

const idl = {
  "version": "0.3.4",
  "name": "vortex",
  "instructions": [],
  "accounts": [
    {
      "name": "Vortex",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "vortexConfig", "type": "publicKey" },
          { "name": "vortexBump", "type": { "array": ["u8", 1] } },
          { "name": "tickSpacing", "type": "u16" },
          { "name": "tickSpacingSeed", "type": { "array": ["u8", 2] } },
          { "name": "feeRate", "type": "u16" },
          { "name": "protocolFeeRate", "type": "u16" },
          { "name": "liquidity", "type": "u128" },
          { "name": "sqrtPrice", "type": "u128" },
          { "name": "tickCurrentIndex", "type": "i32" },
          { "name": "protocolFeeOwedA", "type": "u64" },
          { "name": "protocolFeeOwedB", "type": "u64" },
          { "name": "tokenMintA", "type": "publicKey" },
          { "name": "tokenVaultA", "type": "publicKey" },
          { "name": "feeGrowthGlobalA", "type": "u128" },
          { "name": "tokenMintB", "type": "publicKey" },
          { "name": "tokenVaultB", "type": "publicKey" },
          { "name": "feeGrowthGlobalB", "type": "u128" },
          { "name": "rewardLastUpdatedTimestamp", "type": "u64" },
          { "name": "rewardInfos", "type": { "array": [{ "defined": "VortexRewardInfo" }, 3] } }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "VortexRewardInfo",
      "docs": [
        "Stores the state relevant for tracking liquidity mining rewards at the `Vortex` level.",
        "These values are used in conjunction with `PositionRewardInfo`, `Tick.reward_growths_outside`,",
        "and `Vortex.reward_last_updated_timestamp` to determine how many rewards are earned by open",
        "positions."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "mint", "docs": ["Reward token mint."], "type": "publicKey" },
          { "name": "vault", "docs": ["Reward vault token account."], "type": "publicKey" },
          { "name": "authority", "docs": ["Authority account that has permission to initialize the reward and set emissions."], "type": "publicKey" },
          { "name": "emissionsPerSecondX64", "docs": ["Q64.64 number that indicates how many tokens per second are earned."], "type": "u128" },
          {
            "name": "growthGlobalX64",
            "docs": ["Q64.64 number that tracks the total tokens earned per unit of liquidity since the reward", "emissions were turned on."],
            "type": "u128"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
}