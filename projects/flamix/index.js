/**
 * Flamix Protocol - DefiLlama TVL Adapter
 *
 * Flamix is a derivatives protocol for perpetual trading
 * and binary options with liquidity pool management on Flare.
 *
 * TVL = settlement assets deposited in LexPool (perps) + LiquidityPoolV2 (options)
 *
 * Pools hold "chip" tokens (wrapped representations of source-chain assets).
 * We read the chip balance and map it back to the original token for pricing.
 */

const ADDRESSES = require('../helper/coreAssets.json');

// -- ABIs --
const TOTAL_ASSETS_ABI = "uint256:totalAssets"; // Options V2 pool: returns TVL

// -- Chain ID to DefiLlama chain name --
const CHAIN_NAME = {
  14: "flare",
};

// ============================================================
//  FLARE — Perps Pools (LexPool)
// ============================================================
const FLARE_PERPS_POOLS = [
  ["0x93e9B41F3906472Cc83bb9Bb826648D20A94b929", "0xf764EECe331caB7D7c451a3972e139B4645d6fe8", ADDRESSES.flare.WFLR, 14],     // wFLR
  ["0x0FE9CD465A7E7250489a64E099632560bcE445dB", "0x23011e38Addd5dA64ab8Ad940eE6219095E39382", "0x12e605bc104e93B45e1aD99F9e555f659051c2BB", 14], // sFLR
  ["0xb9656529c75563aB158be4B1d2c71f4e6aC4925e", "0x7e1C6870be30c1f8216f0187C7f181C13c52977A", "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", 14], // USDT0
  ["0xE9A1b26c8A36bac235A608d2F1F248ab65A23525", "0x695b696E80f6f7137731eF509D64023F17550eCE", "0xAd552A648C74D49E10027AB8a618A3ad4901c5bE", 14], // FXRP
  ["0xE69bAAc97591AB53EFee4903000a8995eD246A97", "0x4D131a30aE842B3290651EEd58466a0bC0aC6FD1", "0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3", 14], // stXRP
];

// ============================================================
//  FLARE — Options V2 Pool
// ============================================================
const FLARE_OPTIONS_POOLS = [
  ["0xa3c1c1374319a6238b9ecd39e52448224711dc4c", ADDRESSES.flare.WFLR], // wFLR
];

// ============================================================
//  TVL Calculation
// ============================================================

/**
 * Calculate TVL for LexPool (perps) pools.
 *
 * Each pool holds a "chip" token representing the source-chain asset.
 * We read the chip balance held by the pool and map it to the original
 * token on its source chain so DefiLlama can price it correctly.
 */
async function perpsPoolsTvl(api, pools) {
  const engineChainId = api.getChainId();

  // Read chip balances held by each pool
  const balances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: pools.map(([pool, chip]) => ({ target: chip, params: [pool] })),
  });

  // Read decimals of chip tokens and original tokens to rescale
  const chipDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: pools.map(([, chip]) => chip),
  });
  const originalDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: pools.map(([, , originalToken]) => originalToken),
  });

  for (let i = 0; i < pools.length; i++) {
    const [, , originalToken, sourceChainId] = pools[i];
    const balance = BigInt(balances[i]);
    const chipDec = Number(chipDecimals[i]);
    const origDec = Number(originalDecimals[i]);

    // Balance is in chip-token decimals but will be interpreted using original token decimals.
    // Rescale: if chip has 18 decimals and original has 6, divide by 10^12.
    const decDiff = chipDec - origDec;
    const adjusted = decDiff > 0
      ? balance / BigInt(10 ** decDiff)
      : balance * BigInt(10 ** (-decDiff));

    if (sourceChainId === engineChainId) {
      api.add(originalToken, adjusted.toString());
    } else {
      const chainName = CHAIN_NAME[sourceChainId];
      if (chainName) {
        api.add(`${chainName}:${originalToken}`, adjusted.toString());
      }
    }
  }
}

/**
 * Calculate TVL for Options V2 liquidity pools.
 *
 * These are ERC-4626-style vaults. We call totalAssets() which returns
 * the total settlement assets held, and map to the asset token.
 */
async function optionsPoolsTvl(api, pools) {
  const totalAssets = await api.multiCall({
    abi: TOTAL_ASSETS_ABI,
    calls: pools.map(([pool]) => pool),
  });

  for (let i = 0; i < pools.length; i++) {
    const [, assetAddress] = pools[i];
    api.add(assetAddress, totalAssets[i]);
  }
}

// ============================================================
//  Chain TVL Functions
// ============================================================


async function flareTvl(api) {
  await perpsPoolsTvl(api, FLARE_PERPS_POOLS);
  await optionsPoolsTvl(api, FLARE_OPTIONS_POOLS);
}

// ============================================================
//  Module Exports
// ============================================================

module.exports = {
  methodology:
    "TVL is the sum of settlement assets deposited in Flamix perpetual trading liquidity pools (LexPool) and binary options liquidity pools (LiquidityPoolV2) on Flare.",
  flare: {
    tvl: flareTvl,
  },
};