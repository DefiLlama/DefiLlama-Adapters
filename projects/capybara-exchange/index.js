const { sumTokens2 } = require("../helper/unwrapLPs");
const { getUniTVL } = require('../helper/cache/uniswap');
const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils');

// ─── Kaia (Klaytn) addresses ─────────────────────────────────────────────────

/** MasterWombatV3 – registers all Wombat-style AMM pools */
const MASTER = "0x3CA30C862769b5de7987D2E2db4c1A72800A1Da1";

/** Uniswap-V2-style AMM factory */
const V2_FACTORY = "0xE4296d6161c8a1554a18dba79C0f825cE23bAE42";

/** Uniswap-V3-style concentrated-liquidity factory */
const V3_FACTORY = "0xC4C8310080F209629EC4c349cb2A3c6720e1176D";

/**
 * Conservative fromBlock for V3 factory PoolCreated event discovery.
 * Kaia ~1 block/s; Capybara launched May 2024 (~block 153 M).
 * Set 13 M blocks earlier as a buffer so no early pool is missed.
 */
const V3_START_BLOCK = 140_000_000;

/** Unix timestamp for 2024-05-01 – earliest Capybara contract deployment */
const START_TIMESTAMP = 1714521600;

// ─── TVL sources ──────────────────────────────────────────────────────────────

/** 1. Wombat single-sided AMM pools (registered via MasterWombatV3) */
async function wombatTvl(api) {
  const poolInfos = await api.fetchList({
    // https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-governance/MasterWombatV3.sol#L587
    lengthAbi: 'poolLength',
    itemAbi: "function poolInfo(uint256) external view returns (address asset, uint96, address, uint256, uint104, uint104, uint40)",
    target: MASTER,
  });
  // https://github.com/wombat-exchange/v1-core/blob/5887ec5e1f1cbd067eaee8aee49fcb857fb867c5/contracts/wombat-core/asset/Asset.sol#L4
  const assets = poolInfos.map(i => i.asset);
  const uTokens = await api.multiCall({ abi: 'address:underlyingToken', calls: assets });
  return sumTokens2({ api, tokensAndOwners2: [uTokens, assets] });
}

/** 2. Uniswap-V2-style AMM pairs */
const v2Tvl = getUniTVL({ factory: V2_FACTORY, useDefaultCoreAssets: true });

/** 3. Uniswap-V3-style concentrated-liquidity pools */
const v3Exports = uniV3Export({
  klaytn: {
    factory: V3_FACTORY,
    fromBlock: V3_START_BLOCK,
  },
});

module.exports = mergeExports(
  { start: START_TIMESTAMP },
  {
    klaytn: { tvl: wombatTvl },
  },
  {
    klaytn: { tvl: v2Tvl },
  },
  v3Exports,
);
