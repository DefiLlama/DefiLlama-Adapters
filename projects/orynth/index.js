const { PublicKey } = require("@solana/web3.js");
const { getConnection } = require("../helper/solana");

// Orynth platform constants
const METEORA_DBC_PROGRAM_ID = "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN";
const ORYNTH_PLATFORM_WALLET = "7c8XjugvjW5pMKkrV5myZfoWrQ1QHjwWC3RYZWUToJRk";

/**
 * Calculate TVL from Orynth bonding curve pools only
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
    let bondingPools = 0;

    for (const { pubkey } of accounts) {
      try {
        const poolState = await client.state.getPool(pubkey);
        const quoteReserve = Number(poolState.quoteReserve) / 1e6;
        const isMigrated = poolState.isMigrated === 1;

        if (!isMigrated && quoteReserve > 1) {
          // Only count pools still in bonding curve phase
          bondingCurveTVL += quoteReserve;
          bondingPools++;
        }
      } catch (error) {
        continue;
      }
    }

    console.log(
      `[Orynth] TVL: $${bondingCurveTVL.toFixed(2)} from ${bondingPools} bonding curve pools`
    );

    return {
      solana: bondingCurveTVL,
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
    "TVL includes USDC liquidity in Meteora DBC bonding curve pools during the initial price discovery phase ($5K-$50K market cap). Once tokens graduate and migrate to Meteora DAMM v2, that liquidity is counted as Meteora's TVL. Pools discovered on-chain via Orynth platform creator address (7c8XjugvjW5pMKkrV5myZfoWrQ1QHjwWC3RYZWUToJRk).",
};