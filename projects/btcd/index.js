const { sumTokens2 } = require('../helper/unwrapLPs');

// BTCD on-chain collateral: balanceOf sweep across custody + driver
// addresses, plus explicit unwraps for positions invisible to balanceOf
// (Curve gauge stakes, FluidLite shares, YieldBasis LT, Morpho Blue supply,
// Aave V3 variable debt). Off-chain Fireblocks/CEX balances excluded.

// Mainnet tokens
const WBTC    = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
const USDC    = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDS    = '0xdC035D45d973E3EC169d2276DDab16f1e407384F';
const SUSDS   = '0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD';
const SYRUP   = '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b';
const CBBTC   = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
const HEMIBTC = '0x06ea695B91700071B161A434fED42D1DcbAD9f00';
const SUSDE   = '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497';
const AUSDC          = '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c';
const FLUID_LITE_USD = '0x273DA948ACa9261043fbdb2a857BC255ECC29012'; // not priced — unwrapped via convertToAssets
const CURVE_HEMI_LP  = '0x66039342C66760874047c36943B1e2d8300363BB';
const CURVE_SUSDE_LP = '0x3CEf1AFC0E8324b57293a6E7cE663781bbEFBB79';

// balanceOf(gauge, strategy) maps 1:1 to LP; registered under the LP address.
const CURVE_GAUGE_STAKES = [
  { gauge: '0xeCBcF829742987c0600e0ee1117a32d09451882E', strategy: '0x7c82B4A667bf5DD6a58DBFDb34ac3A4E0D2C6543', lp: CURVE_HEMI_LP },
  { gauge: '0xc4316d27eC627E03BD4d176E570cD0018e6a0456', strategy: '0x81Ae2ce1a7af582E1f186C0D88415Fd752EAe814', lp: CURVE_SUSDE_LP },
];

// Aave V3 variable-debt token whose balance equals the strategy's outstanding
// debt; this is netted against the borrowed underlying (WBTC).
const VAR_DEBT_WBTC = '0x40aAbEf1aa8f0eEc637E0E7d92fbfFB2F26A8b7B';

// ─────────────────────────── Static custody owners ────────────────────────────
const STATIC_CUSTODY = [
  '0xD22FFF18B5E25EF1f07F8E194b89966652d44f5b', // BTCDMinting
  '0x700ac5F087468a253920818e662f08AD7d991AF5', // VaultMinting
  '0x98a622d669BaeA302DaB1B489748f78F768E8b25', // SlushFund
];

// ──────────────────────── Driver (strategy) addresses ─────────────────────────
const DRV_CURVE_HEMI    = '0x7c82B4A667bf5DD6a58DBFDb34ac3A4E0D2C6543'; // CURVE:WBTCCBBTCHEMIBTCTRIPOOL:WBTC:0
const DRV_MORPHO_SBTCD  = '0x24313a5DB051E08e8064582F8a5e2F5C52968319'; // MORPHOBLUE:SBTCDWBTC:WBTC:0
const DRV_YIELD_BASIS   = '0x174A18b8fdf9ae3ff5e841b69cA9A57D2EBFCA59'; // YIELDBASIS:WBTC:WBTC:0
const DRV_AAVE_CARRY    = '0x7457Af3cbc75e30042BF1B7dA69cabc5D5563E4b'; // AAVECARRY:SBTCDWBTC:USDC:0
const DRV_CURVE_SUSDE   = '0x81Ae2ce1a7af582E1f186C0D88415Fd752EAe814'; // CURVE:SUSDESUSDS:USDC:0
const DRV_FLUID_LITE    = '0xfDD0224cC556aF301E06D46bbe27b5298d25A0F9'; // FLUIDLITE:LITEUSD:USDC:0
const DRV_SUSDS         = '0x344E78a1B267c19DfD6D53838E8815AC54e2Cf58'; // SUSDS:sUSDS:USDC:0
const DRV_UNIV4_SYRUP   = '0xdE128F649634e7B3e4b6c372836d38F435DA9Ba3'; // UNIV4SWAP:SYRUPUSDC:USDC:0

// Morpho Blue supply positions (account-based, not balanceOf-visible). Both
// the MorphoBlueSupply driver and the Aave-carry-trade driver supply WBTC
// into the same SBTCD-WBTC market.
const MORPHO_BLUE = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb';
const SBTCD_WBTC_MARKET = '0xc2ab3fb4c64dc05d69a833cbedb82d6869d05135f3a164c0c7b844c8f0a3a220';
const MORPHO_POSITIONS = [
  { strategy: DRV_MORPHO_SBTCD, marketId: SBTCD_WBTC_MARKET, loanToken: WBTC },
  { strategy: DRV_AAVE_CARRY,   marketId: SBTCD_WBTC_MARKET, loanToken: WBTC },
];

// ─────────────────────────── Arbitrum (GMX V2 sleeve) ─────────────────────────
const ARBITRUM_GM_POSITION_MANAGER = '0xAf307925E44bbAc289C1EF6221a8Ae36B839f4d0';
const ARBITRUM_BRIDGE_OWNERS = [
  '0x716fad40899277e5914bf7fc5f2563caf1afc099', // BridgeManager (in-transit)
  '0xAa8DcD578f23A09065Aa6028Aa9c091554055c8A', // BridgeActor
];

// ─────────────────────────────────── ABIs ─────────────────────────────────────
const balanceOfAbi = 'erc20:balanceOf';
const morphoMarketAbi =
  'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)';
const morphoPositionAbi =
  'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)';

/**
 * Adds a token balance to the API accumulator only when strictly positive.
 * Skips null/undefined/zero amounts so failed multicalls (with permitFailure)
 * and empty positions don't pollute the TVL with falsy entries.
 *
 * @param {object} api    DefiLlama SDK chain API (provides .add()).
 * @param {string} token  ERC-20 contract address whose balance is being added.
 * @param {string|number|bigint} amount  Raw on-chain amount (token base units).
 */
const addIfPositive = (api, token, amount) => {
  if (amount && BigInt(amount) > 0n) api.add(token, amount.toString());
};

// ────────────────────────────── Top-level TVL ─────────────────────────────────
// Morpho Blue uses virtual offsets on share<->asset conversion to prevent
// inflation attacks; ignoring them leaves a sub-bp error vs the on-chain
// value. Mirror the contract's constants.
const MORPHO_VIRTUAL_ASSETS = 1n;
const MORPHO_VIRTUAL_SHARES = 1000000n; // 1e6

/**
 * Computes BTCD's Ethereum-mainnet TVL by aggregating on-chain collateral
 * across custody contracts and strategy drivers.
 *
 * Steps:
 *   1. balanceOf sweep over static custody + driver addresses for all tracked
 *      ERC-20s (WBTC, stables, LP tokens, aTokens, etc.).
 *   2. Curve gauge stakes — gauge.balanceOf(strategy) maps 1:1 to LP and is
 *      registered under the LP address.
 *   3. FluidLite shares — convertToAssets() unwraps shares to underlying USDC.
 *   4. YieldBasis driver — totalAssets() reports full WBTC value (the driver
 *      itself is excluded from the balanceOf sweep to avoid double-counting).
 *   5. Morpho Blue supply positions — read via position()+market(), applying
 *      the protocol's virtual-offset share/asset conversion to stay consistent
 *      with on-chain accounting (sub-bp error otherwise).
 *   6. Aave V3 variable debt — netted out by subtracting variableDebtWBTC
 *      from the carry-trade strategy.
 *
 * Off-chain Fireblocks/CEX balances are intentionally excluded.
 *
 * @param {object} api  DefiLlama SDK ethereum chain API.
 * @returns {Promise<object>} The accumulated balances map (api.getBalances()).
 */
async function ethereumTvl(api) {
  // YB driver excluded — its full WBTC value is registered via totalAssets() below.
  const owners = [
    ...STATIC_CUSTODY,
    DRV_CURVE_HEMI, DRV_MORPHO_SBTCD, DRV_AAVE_CARRY,
    DRV_CURVE_SUSDE, DRV_FLUID_LITE, DRV_SUSDS, DRV_UNIV4_SYRUP,
  ];
  const tokens = [
    WBTC, USDC, USDS, SUSDS, SYRUP,
    CBBTC, HEMIBTC, SUSDE,
    AUSDC, CURVE_HEMI_LP, CURVE_SUSDE_LP,
  ];
  await sumTokens2({ api, owners, tokens, permitFailure: true });

  const gaugeBalances = await api.multiCall({
    abi: balanceOfAbi,
    calls: CURVE_GAUGE_STAKES.map((g) => ({ target: g.gauge, params: g.strategy })),
    permitFailure: true,
  });
  gaugeBalances.forEach((bal, i) => addIfPositive(api, CURVE_GAUGE_STAKES[i].lp, bal));

  const fLiteShares = await api.call({
    target: FLUID_LITE_USD,
    abi: balanceOfAbi,
    params: [DRV_FLUID_LITE],
  });
  if (BigInt(fLiteShares) > 0n) {
    const usdc = await api.call({
      target: FLUID_LITE_USD,
      abi: 'function convertToAssets(uint256) view returns (uint256)',
      params: [fLiteShares],
    });
    addIfPositive(api, USDC, usdc);
  }

  const yb = await api.call({
    target: DRV_YIELD_BASIS,
    abi: 'function totalAssets() view returns (uint256 totalAssets_, uint256 totalShares_)',
  });
  addIfPositive(api, WBTC, yb.totalAssets_);

  const [positions, market] = await Promise.all([
    api.multiCall({
      abi: morphoPositionAbi,
      calls: MORPHO_POSITIONS.map((p) => ({
        target: MORPHO_BLUE,
        params: [p.marketId, p.strategy],
      })),
    }),
    api.call({
      target: MORPHO_BLUE,
      abi: morphoMarketAbi,
      params: [SBTCD_WBTC_MARKET],
    }),
  ]);
  const totalSupplyAssets = BigInt(market.totalSupplyAssets) + MORPHO_VIRTUAL_ASSETS;
  const totalSupplyShares = BigInt(market.totalSupplyShares) + MORPHO_VIRTUAL_SHARES;
  positions.forEach((pos, i) => {
    if (!pos) return;
    const shares = BigInt(pos.supplyShares);
    if (shares === 0n) return;
    const assets = (shares * totalSupplyAssets) / totalSupplyShares;
    addIfPositive(api, MORPHO_POSITIONS[i].loanToken, assets);
  });

  const debt = await api.call({
    target: VAR_DEBT_WBTC,
    abi: balanceOfAbi,
    params: [DRV_AAVE_CARRY],
  });
  if (debt && BigInt(debt) > 0n) api.add(WBTC, '-' + BigInt(debt).toString());

  return api.getBalances();
}

/**
 * Computes BTCD's Arbitrum TVL for the GMX V2 sleeve.
 *
 * Reads the position manager's configured long/short/GM token addresses on
 * the fly (no hardcoding), then registers:
 *   - GM tokens held by the position manager
 *   - idle long/short tokens awaiting deposit
 *   - in-transit balances on the bridge owners (BridgeManager + BridgeActor)
 *
 * Pending deposit/withdrawal keys returned by getRawBalance() are not yet
 * factored in — only the realized GM balance and idle inventory are counted.
 *
 * @param {object} api  DefiLlama SDK arbitrum chain API.
 */
async function arbitrumTvl(api) {
  const [longToken, shortToken, gmToken] = await Promise.all([
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function LONG_TOKEN() view returns (address)' }),
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function SHORT_TOKEN() view returns (address)' }),
    api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function GM_TOKEN() view returns (address)' }),
  ]);

  const raw = await api.call({
    target: ARBITRUM_GM_POSITION_MANAGER,
    abi: 'function getRawBalance() view returns (uint256 gmBalance, uint256 idleLongToken, uint256 idleShortToken, bytes32 pendingDepositKey, bytes32 pendingWithdrawalKey)',
  });
  addIfPositive(api, gmToken, raw.gmBalance);
  addIfPositive(api, longToken, raw.idleLongToken);
  addIfPositive(api, shortToken, raw.idleShortToken);

  await sumTokens2({
    api,
    owners: ARBITRUM_BRIDGE_OWNERS,
    tokens: [longToken, shortToken, gmToken],
    permitFailure: true,
  });
}

module.exports = {
  methodology:
    'On-chain collateral across the protocol\'s custody contracts and eight ' +
    'driver contracts. Most value is captured by ERC-20 balanceOf; Curve gauge ' +
    'stakes, FluidLite shares, the YieldBasis LT, Morpho Blue supply, and Aave ' +
    'V3 variable debt are read explicitly. Arbitrum holds the GMX V2 sleeve. ' +
    'Off-chain custody is not included.',
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: arbitrumTvl },
};
