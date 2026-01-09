const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

// Orynth platform constants
const METEORA_DBC_PROGRAM_ID = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
const ORYNTH_PLATFORM_WALLET = "7c8XjugvjW5pMKkrV5myZfoWrQ1QHjwWC3RYZWUToJRk";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

/**
 * Get TVL from migrated DAMM v2 pool using Meteora SDK
 */
async function getDammV2Liquidity(connection, poolState, client) {
  try {
    const {
      deriveDammV2PoolAddress,
      DAMM_V2_MIGRATION_FEE_ADDRESS,
      MigrationFeeOption,
    } = require("@meteora-ag/dynamic-bonding-curve-sdk");
    const { CpAmm } = require("@meteora-ag/cp-amm-sdk");

    // Get the pool's migration fee option from its config
    const configState = await client.state.getPoolConfig(poolState.config);
    const migrationFeeOption =
      configState.migrationFeeOption ?? MigrationFeeOption.FixedBps100;

    // Get the DAMM v2 config address
    const dammConfigAddress = new PublicKey(
      DAMM_V2_MIGRATION_FEE_ADDRESS[migrationFeeOption]
    );

    // Derive DAMM v2 pool address (handles token sorting internally)
    const dammV2PoolAddress = deriveDammV2PoolAddress(
      dammConfigAddress,
      poolState.baseMint,
      new PublicKey(USDC_MINT)
    );

    // Fetch pool state using CP-AMM SDK
    const cpAmm = new CpAmm(connection);
    const dammPoolState = await cpAmm.fetchPoolState(dammV2PoolAddress);

    // Get token vault balances
    const { getAccount } = require("@solana/spl-token");
    const tokenAVaultAccount = await getAccount(
      connection,
      dammPoolState.tokenAVault
    );
    const tokenBVaultAccount = await getAccount(
      connection,
      dammPoolState.tokenBVault
    );

    const tokenAReserve = Number(tokenAVaultAccount.amount) / 1e6;
    const tokenBReserve = Number(tokenBVaultAccount.amount) / 1e6;

    // Check which token is USDC
    const usdcMint = new PublicKey(USDC_MINT);
    const isTokenAUsdc = dammPoolState.tokenAMint.equals(usdcMint);

    return isTokenAUsdc ? tokenAReserve : tokenBReserve;
  } catch (error) {
    // Pool doesn't exist or other error - return 0
    return 0;
  }
}

/**
 * Calculate TVL across all Orynth tokens (bonding curve + migrated)
 */
async function tvl() {
  const connection = await getConnection();

  try {
    const { DynamicBondingCurveClient } = require("@meteora-ag/dynamic-bonding-curve-sdk");
    const client = new DynamicBondingCurveClient(connection, "confirmed");

    // Fetch all Orynth pool accounts (filtered by creator)
    const accounts = await connection.getProgramAccounts(
      new PublicKey(METEORA_DBC_PROGRAM_ID),
      {
        filters: [
          {
            dataSize: 424, // Pool account size
          },
          {
            memcmp: {
              offset: 104, // Creator offset
              bytes: ORYNTH_PLATFORM_WALLET,
            },
          },
        ],
      }
    );

    console.log(`[Orynth] Found ${accounts.length} pools on mainnet`);

    let bondingCurveTVL = 0;
    let dammV2TVL = 0;
    let bondingPools = 0;
    let migratedPools = 0;

    for (const { pubkey } of accounts) {
      try {
        const poolState = await client.state.getPool(pubkey);
        const quoteReserve = Number(poolState.quoteReserve) / 1e6;
        const isMigrated = poolState.isMigrated === 1;

        if (isMigrated && quoteReserve > 1) {
          // Pool has migrated - get DAMM v2 liquidity
          const dammLiquidity = await getDammV2Liquidity(
            connection,
            poolState,
            client
          );

          if (dammLiquidity > 1) {
            dammV2TVL += dammLiquidity;
            migratedPools++;
          }
        } else if (!isMigrated && quoteReserve > 1) {
          // Still in bonding curve
          bondingCurveTVL += quoteReserve;
          bondingPools++;
        }
      } catch (error) {
        continue;
      }
    }

    const totalTvl = bondingCurveTVL + dammV2TVL;

    console.log(
      `[Orynth] TVL: $${totalTvl.toFixed(2)} | Bonding: $${bondingCurveTVL.toFixed(2)} (${bondingPools} pools) | DAMM v2: $${dammV2TVL.toFixed(2)} (${migratedPools} pools)`
    );

    return {
      solana: totalTvl,
    };
  } catch (error) {
    console.error("[Orynth] Error calculating TVL:", error.message);
    return {
      solana: 0,
    };
  }
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology:
    "TVL includes USDC liquidity across the entire Orynth token lifecycle: (1) Bonding curve phase - USDC in Meteora DBC pools during initial price discovery ($5K-$50K market cap), and (2) Graduated phase - liquidity in Meteora DAMM v2 pools after tokens reach $50K and migrate to external DEX. Pools discovered on-chain via Orynth platform creator address (7c8XjugvjW5pMKkrV5myZfoWrQ1QHjwWC3RYZWUToJRk).",
};