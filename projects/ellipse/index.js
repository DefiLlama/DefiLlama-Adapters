/*
 * DefiLlama TVL adapter — Ellipse (ellipse.fun), on Circle's Arc chain.
 *
 * Ellipse is three things under one roof, so TVL is reported without double-counting:
 *
 *  1. BRIDGE CUSTODY (the real backing). Each bridged asset on Arc (bCRCL, bGLD,
 *     bBTCB, bUSDT) is a 1:1 claim on a real asset held in a CustodyVault on the
 *     asset's ORIGIN chain. We count those origin reserves where they actually sit:
 *       - Robinhood Chain (4663): CRCL and GLD held in their vaults.
 *       - BSC (56):               USDT and BTCB held in their vaults.
 *     DefiLlama already prices all four (CRCL, GLD on robinhood; USDT, BTCB on bsc).
 *
 *  2. DEX LIQUIDITY on Arc — but ONLY the non-bridged side (USDC + ELLIPSE).
 *     The pools also hold the b-tokens, but those are claims already counted in (1);
 *     summing them here would double-count the same underlying.
 *
 * WHY UNISWAP v4 IS NOT COUNTED HERE (yet)
 *
 * An earlier revision of this adapter summed USDC and ELLIPSE held by the v4
 * PoolManager. That was wrong, and the amount is not small. v4 is a singleton:
 * ONE contract holds the reserves of EVERY v4 pool on the chain, not just ours.
 * Measured on Arc while fixing this: the PoolManager held 3,330,521 USDC, while
 * the USDC in Ellipse's own v4 pools was on the order of ten thousand — the rest
 * belongs to other protocols. In the 50,000 blocks before that reading alone,
 * 587 USDC-paired v4 pools were initialised on Arc by third parties.
 *
 * So the singleton balance is not a proxy for one protocol's TVL on a chain with
 * more than one v4 deployer, and Arc now has many. Counting it would have
 * reported roughly 3.7M of TVL for Ellipse, most of it other people's money.
 *
 * Ellipse's own v4 liquidity (its RWA pools and its launch pools) is therefore
 * left OUT of this adapter rather than over-counted. It will be added back with
 * per-PoolKey attribution — Ellipse's launch pools are identifiable by their
 * hook, which by construction only its launchpad can use — once that is written
 * and verified. Under-reporting is a fixable error; over-reporting is not.
 *
 * The b-token addresses on Arc are intentionally NOT summed anywhere — their value
 * lives in the custody reserves.
 */

const CUSTODY = {
  robinhood: [
    // [ origin token, vault holding it ]
    ["0xdF0992E440dD0be65BD8439b609d6D4366bf1CB5", "0xed811A67C40B25D02A39492D91Aaab335b2cBD92"], // CRCL
    ["0xC9a981FEE1F9DEc688bb123ccDeCc63D0deBFC4e", "0x96F98bA395976B0a7d62088A597Cd8B71233A3fE"], // GLD
  ],
  bsc: [
    ["0x55d398326f99059fF775485246999027B3197955", "0x402c61C3620d915C5Cc4160dd059a5f199c96D23"], // USDT
    ["0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", "0x2F8dD161539fF04FF63f2c1303e671732450a7e0"], // BTCB
  ],
};

// Arc — non-bridged pool value only (USDC + ELLIPSE), v3 pools only. See the
// note above for why the v4 PoolManager is deliberately absent from this list.
const ARC = {
  usdc: "0x3600000000000000000000000000000000000000",
  ellipse: "0x86F7424C3e1EBb3F42e1E687468e36D5f2A1222E",
  // v3 asset/USDC pools (hold USDC)
  usdcPools: [
    "0x8b3F1194F8a2D067fa91D2E8073b27B710062347", // CRCL/USDC 1%
    "0xC4bB8F51E1732e80d16929180e2A9387E8A0C4e1", // GLD/USDC 1%
    "0xfD938605b706883216b3CF859C5209B9C6E2Bcd5", // USDT/USDC 1%
    "0x376D2128728E949d5dbFC4E1780c8a5c6799236C", // USDT/USDC 0.3%
    "0xe5ca3eF671dd895eE86392024acF42f065f4b821", // BTCB/USDC 1%
    "0x7C7B96B200c1C518a615cbF3e956254b3a51F1A4", // BTCB/USDC 0.3%
  ],
  ellipsePool: "0x0Abd501F56CD434D346CD5Bf3B67aEF461ebBc2d", // ELLIPSE/bCRCL v3 1%
};

const custodyTvl = (chain) => async (api) =>
  api.sumTokens({ tokensAndOwners: CUSTODY[chain] });

async function arcTvl(api) {
  const tokensAndOwners = [];
  // USDC held by every v3 asset/USDC pool
  for (const pool of ARC.usdcPools) tokensAndOwners.push([ARC.usdc, pool]);
  // ELLIPSE held by its v3 pool
  tokensAndOwners.push([ARC.ellipse, ARC.ellipsePool]);
  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology:
    "Bridge custody: real assets backing the 1:1 claim tokens, counted in their CustodyVaults on the origin chains (CRCL and GLD on Robinhood Chain, USDT and BTCB on BSC). DEX: only the non-bridged liquidity (USDC and ELLIPSE) in the Arc v3 pools — the bridged tokens in those pools are claims already counted in custody, so they are excluded to avoid double-counting. Uniswap v4 liquidity is not counted: v4 keeps every pool's reserves in one shared PoolManager, so its balance is not attributable to a single protocol on a chain with several v4 deployers, and Arc has many. Ellipse's own v4 pools will be added once per-PoolKey attribution is in place.",
  robinhood: { tvl: custodyTvl("robinhood") },
  bsc: { tvl: custodyTvl("bsc") },
  arc: { tvl: arcTvl },
};
