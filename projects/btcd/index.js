const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json')

// ─────────────────────────── Ethereum Static custody owners ───────────────────
const STATIC_CUSTODY = [
  '0xD22FFF18B5E25EF1f07F8E194b89966652d44f5b', // BTCDMinting
  '0x700ac5F087468a253920818e662f08AD7d991AF5', // VaultMinting
];

// ──────────────────────── Ethereum Driver (strategy) addresses ────────────────
const DRV_CURVE_HEMI    = '0x7c82B4A667bf5DD6a58DBFDb34ac3A4E0D2C6543'; // CURVE:WBTCCBBTCHEMIBTCTRIPOOL:WBTC:0
const DRV_MORPHO_SBTCD  = '0x24313a5DB051E08e8064582F8a5e2F5C52968319'; // MORPHOBLUE:SBTCDWBTC:WBTC:0
const DRV_YIELD_BASIS   = '0x174A18b8fdf9ae3ff5e841b69cA9A57D2EBFCA59'; // YIELDBASIS:WBTC:WBTC:0
const DRV_AAVE_CARRY    = '0x7457Af3cbc75e30042BF1B7dA69cabc5D5563E4b'; // AAVECARRY:SBTCDWBTC:USDC:0
const DRV_CURVE_SUSDE   = '0x81Ae2ce1a7af582E1f186C0D88415Fd752EAe814'; // CURVE:SUSDESUSDS:USDC:0
const DRV_FLUID_LITE    = '0xfDD0224cC556aF301E06D46bbe27b5298d25A0F9'; // FLUIDLITE:LITEUSD:USDC:0
const DRV_SUSDS         = '0x344E78a1B267c19DfD6D53838E8815AC54e2Cf58'; // SUSDS:sUSDS:USDC:0
const DRV_UNIV4_SYRUP   = '0xdE128F649634e7B3e4b6c372836d38F435DA9Ba3'; // UNIV4SWAP:SYRUPUSDC:USDC:0

// ─────────────────────────── Arbitrum (GMX V2 sleeve) ─────────────────────────
const ARBITRUM_GM_POSITION_MANAGER = '0xAf307925E44bbAc289C1EF6221a8Ae36B839f4d0';
const ARBITRUM_BRIDGE_OWNERS = [
  '0x716fad40899277e5914bf7fc5f2563caf1afc099', // BridgeManager (in-transit)
  '0xAa8DcD578f23A09065Aa6028Aa9c091554055c8A', // BridgeActor
];

const ethTokens = [
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDS,
  ADDRESSES.ethereum.sUSDS,
  ADDRESSES.ethereum.cbBTC,
  ADDRESSES.ethereum.sUSDe,
  '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
  '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // SYRUP
  '0x06ea695B91700071B161A434fED42D1DcbAD9f00', // HEMIBTC
  '0x66039342C66760874047c36943B1e2d8300363BB', // Curve HemiCbWBTC LP
  '0x3CEf1AFC0E8324b57293a6E7cE663781bbEFBB79', // Curve sUSDeUSDS LP
  '0xeCBcF829742987c0600e0ee1117a32d09451882E', // Curve HemiCbWBTC gauge
  '0xc4316d27eC627E03BD4d176E570cD0018e6a0456', // Curve sUSDeUSDS gauge
  '0x273DA948ACa9261043fbdb2a857BC255ECC29012', // fLiteUSD share token
  '0x40aAbEf1aa8f0eEc637E0E7d92fbfFB2F26A8b7B', // variableDebtEthWBTC (debt)
];

// YB driver excluded — its full WBTC value is tracked via totalAssets()
const ethOwners = [
  ...STATIC_CUSTODY,
  DRV_CURVE_HEMI, DRV_MORPHO_SBTCD, DRV_AAVE_CARRY,
  DRV_CURVE_SUSDE, DRV_FLUID_LITE, DRV_SUSDS, DRV_UNIV4_SYRUP,
];

// Morpho Blue uses virtual offsets on share<->asset conversion to prevent
// inflation attacks; ignoring them leaves a sub-bp error vs the on-chain
// value. Mirror the contract's constants.
const MORPHO_VIRTUAL_ASSETS = 1n;
const MORPHO_VIRTUAL_SHARES = 1000000n; // 1e6

const morphoMarketAbi = 'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)';
const morphoPositionAbi = 'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)';

const MORPHO_BLUE = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb';
const SBTCD_WBTC_MARKET = '0xc2ab3fb4c64dc05d69a833cbedb82d6869d05135f3a164c0c7b844c8f0a3a220';
const morphoSuppliers = [DRV_MORPHO_SBTCD, DRV_AAVE_CARRY]

/**
 * Computes BTCD's Ethereum-mainnet TVL by aggregating on-chain collateral
 * across custody contracts and strategy drivers.
 *
 * Steps:
 *   1. balanceOf sweep over static custody + driver addresses for all tracked
 *      ERC-20s. Includes Curve gauge tokens, the fLiteUSD share token, 
 *      and the Aave V3 variable-debt WBTC token (priced negative).
 *   2. YieldBasis driver — totalAssets() reports full WBTC value (the driver
 *      itself is excluded from the balanceOf sweep to avoid double-counting).
 *   3. Morpho Blue supply positions — read via position()+market(), applying
 *      the protocol's virtual-offset share/asset conversion to stay consistent
 *      with on-chain accounting.
 *
 * Off-chain Fireblocks/CEX balances are intentionally excluded.
 */
async function ethereumTvl(api) {
  await sumTokens2({ api, owners: ethOwners, tokens: ethTokens });

  const yb = await api.call({
    target: DRV_YIELD_BASIS,
    abi: 'function totalAssets() view returns (uint256 totalAssets_, uint256 totalShares_)',
  });
  api.add(ADDRESSES.ethereum.WBTC, yb.totalAssets_);

  const [positions, market] = await Promise.all([
    api.multiCall({
      abi: morphoPositionAbi,
      calls: morphoSuppliers.map((s) => ({
        target: MORPHO_BLUE,
        params: [SBTCD_WBTC_MARKET, s],
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
    api.add(ADDRESSES.ethereum.WBTC, assets);
  });
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
  api.add(gmToken, raw.gmBalance);
  api.add(longToken, raw.idleLongToken);
  api.add(shortToken, raw.idleShortToken);

  await sumTokens2({
    api,
    owners: ARBITRUM_BRIDGE_OWNERS,
    tokens: [longToken, shortToken, gmToken],
  });
}

module.exports = {
  methodology:
    'On-chain collateral across the protocol\'s custody contracts and eight ' +
    'driver contracts. Most value is captured by ERC-20 balanceOf (including ' +
    'Curve gauge tokens, fLiteUSD shares, and Aave V3 variable-debt WBTC ' +
    '— priced negatively to net out carry-trade debt); the YieldBasis LT ' +
    'and Morpho Blue supply positions are read explicitly. Arbitrum holds ' +
    'the GMX V2 sleeve. Off-chain custody is not included.',
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: arbitrumTvl },
};

