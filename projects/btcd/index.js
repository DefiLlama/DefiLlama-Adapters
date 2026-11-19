const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json')

// ─────────────────────────── Ethereum strategy discovery ──────────────────────
// The engine Multicall only calls targets it has authorized, so its target list
// is the live set of strategy position managers. Each one names itself through
// TYP(), formatted "<protocol>:<investment>:<io token>:<version>".
const ENGINE_MULTICALL = '0x18f1FAC179feB0ee44F339a616feFb979A6961BE';

// ─────────────────────────── Ethereum static custody ──────────────────────────
// Reserve contracts swept for idle tokens. Strategy targets are added at run
// time; targets without a TYP are not swept, so an authorized third-party
// contract can never be counted as BTCD collateral.
const STATIC_CUSTODY = [
  '0xD22FFF18B5E25EF1f07F8E194b89966652d44f5b', // BTCDMinting
  '0xc60F6892973934C93AdE915d5c249f10d4eCE7b4', // VaultMinting
  '0x613cB55810C0BA4262bBB18Bc31900a6BbFc6fc3', // BridgeManager (in-transit to Arbitrum)
  '0x523f6B7C7B314228f0dE8C9924B8b8C8C08a2BFf', // YieldBasis hybrid position manager
  '0x0601E1B0d579441A90c07cC8077C7D36b3EF23f7', // YieldBasis hybrid vault (scrvUSD backing leg)
];

// ─────────────────────────── YieldBasis hybrid sleeve ─────────────────────────
// The hybrid vault custodies one YieldBasis LT per BTC market. It is driven by
// its own actor, not the Multicall.
const YB_HYBRID_VAULT = '0x0601E1B0d579441A90c07cC8077C7D36b3EF23f7';
const YB_HYBRID_LTS = [
  '0x651D4b8168488FA163D85304662E8278d4c55BAa', // yb-WBTC
  '0x722FC3640BA007C3E9867CCdB0dCa59F2e2F29F9', // yb-cbBTC
  '0x771F7290428d830ECd41E980745c327e507823Ec', // yb-tBTC
];

// ─────────────────────────── Strategies without position getters ─────────────
// Stake DAO and Morpho carry position managers expose only TYP(), so their
// venue is looked up by the TYP investment name. A strategy missing here is
// skipped (its idle tokens are still counted).
const STAKEDAO_VAULTS = {
  FRXUSDSUSDS: '0x5E1DACDBEF6bcEba53600d0BcE33FD30EE09fA82',
  FRXUSDDUSD: '0x6ea128D83bc4223A0d1e6E475CEE85998AcB6337',
  FRXUSDUSD3: '0xcad206958a16080eDe0b1e9245D6689554Ed5600',
  FRXUSDSUSDE: '0xE70Fc8fFb97f6D539E5d50F657F4AAe69F01B87D',
  WBTCCBBTCHEMIBTCTRIPOOL: '0x3C69C2F6852C65CDD8e02C4FdA1A7221CB79DDd5',
  CBBTCWBTC: '0x3bf225861cbB865A0aBeccC8ba924748118276f3',
  VUSDCRVUSD: '0x102A475c8d660fDe678D108DCc6D4A2227661AF2',
  CRVUSDUSDC: '0xD4467fBCBd3511112D2FD1af667E745D4987C8eb',
  PYUSDCRVUSD: '0x0F67C05A034fEC0183ad74d3be42c8Ba27F6c4c4',
  SCRVUSDSUSDE: '0xABf0973EC993be9F0151cFe4CD03A87c3CC7f638',
  USD3SCRVUSD: '0x7b303cF6124A74a867C99889d39278Bc63e1054B',
  REUSDSCRVUSD: '0xC5F79C63715cc7F3d65818b6b7B585Eb5b00AA74',
  USDTUSDE: '0x238A772cf271eb8bB7b75B91F102FC854F043542',
};
// Morpho carry: WBTC collateral on a Morpho Blue market, the borrowed loan
// token deployed to an ERC-4626 vault.
const MORPHOCARRY_VENUES = {
  FLUIDLITE: {
    marketId: '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49', // WBTC/USDC
    vault: '0x273DA948ACa9261043fbdb2a857BC255ECC29012', // fLiteUSD
  },
};

// ─────────────────────────── Arbitrum (GMX V2 sleeve) ─────────────────────────
const ARBITRUM_GM_POSITION_MANAGER = '0xAf307925E44bbAc289C1EF6221a8Ae36B839f4d0';
const ARBITRUM_BRIDGE_OWNERS = [
  '0x716fad40899277e5914bf7fc5f2563caf1afc099', // BridgeManager (in-transit)
  '0xAa8DcD578f23A09065Aa6028Aa9c091554055c8A', // BridgeActor
];

// Tokens counted by plain balanceOf on every custody contract and strategy
// target: idle reserves, funds in transit, and holdings DefiLlama prices
// directly (sUSDS for the SUSDS strategy, syrupUSDC for the UNIV4SWAP one,
// scrvUSD for the YieldBasis hybrid vault).
const idleTokens = [
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.USDS,
  ADDRESSES.ethereum.sUSDS,
  ADDRESSES.ethereum.USDe,
  ADDRESSES.ethereum.sUSDe,
  ADDRESSES.ethereum.cbBTC,
  ADDRESSES.ethereum.tBTC,
  ADDRESSES.ethereum.CRVUSD,
  '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367', // scrvUSD
  '0xCAcd6fd266aF91b8AeD52aCCc382b4e165586E29', // frxUSD
  '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // PYUSD
  '0x80ac24aA929eaF5013f6436cdA2a7ba190f5Cc0b', // syrupUSDC
];

// Morpho Blue uses virtual offsets on share<->asset conversion to prevent
// inflation attacks; ignoring them leaves a sub-bp error vs the on-chain
// value. Mirror the contract's constants.
const MORPHO_BLUE = '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb';
const MORPHO_VIRTUAL_ASSETS = 1n;
const MORPHO_VIRTUAL_SHARES = 1000000n; // 1e6

const abi = {
  getAuthorizedTargets: 'function getAuthorizedTargets() view returns (address[])',
  TYP: 'function TYP() view returns (string)',
  MARKET_ID: 'function MARKET_ID() view returns (bytes32)',
  VAULT: 'function VAULT() view returns (address)',
  POOL: 'function POOL() view returns (address)',
  gauge: 'function gauge() view returns (address)',
  LT: 'function LT() view returns (address)',
  ASSET: 'function ASSET() view returns (address)',
  A_USDC: 'function A_USDC() view returns (address)',
  VARIABLE_DEBT_WBTC: 'function VARIABLE_DEBT_WBTC() view returns (address)',
  previewWithdraw: 'function preview_withdraw(uint256 shares) view returns (uint256)',
  ltAsset: 'function ASSET_TOKEN() view returns (address)',
  convertToAssets: 'function convertToAssets(uint256 shares) view returns (uint256)',
  asset: 'function asset() view returns (address)',
  morphoMarket: 'function market(bytes32 id) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
  morphoPosition: 'function position(bytes32 id, address user) view returns (uint256 supplyShares, uint128 borrowShares, uint128 collateral)',
  morphoMarketParams: 'function idToMarketParams(bytes32 id) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
};

/**
 * Converts a Morpho Blue position/market/params read into supplied and
 * borrowed loan-token assets (shares converted with the virtual offsets;
 * debt rounded up as Morpho does) and the posted collateral.
 */
function morphoPosition(pos, market, params) {
  const supplyAssets = BigInt(market.totalSupplyAssets) + MORPHO_VIRTUAL_ASSETS;
  const supplyShares = BigInt(market.totalSupplyShares) + MORPHO_VIRTUAL_SHARES;
  const borrowAssets = BigInt(market.totalBorrowAssets) + MORPHO_VIRTUAL_ASSETS;
  const borrowShares = BigInt(market.totalBorrowShares) + MORPHO_VIRTUAL_SHARES;
  return {
    loanToken: params.loanToken,
    collateralToken: params.collateralToken,
    supplied: (BigInt(pos.supplyShares) * supplyAssets) / supplyShares,
    borrowed: (BigInt(pos.borrowShares) * borrowAssets + borrowShares - 1n) / borrowShares,
    collateral: BigInt(pos.collateral),
  };
}

// Each valuer returns the [token, amount] holdings of one strategy position
// manager from the reads addStrategyPositions stored on it, excluding idle
// tokens (those are counted by the balanceOf sweep). Debt is a negative amount
// of the borrowed token.
const VALUERS = {
  // WBTC supplied to the Morpho Blue market the PM names.
  MORPHOBLUE: ({ morpho }) => [[morpho.loanToken, morpho.supplied]],
  // USDC supplied on Aave, minus the WBTC borrowed against it, plus that WBTC
  // supplied to the PM's Morpho Blue market.
  AAVECARRY: ({ morpho, aUsdcBalance, debt }) =>
    [[morpho.loanToken, morpho.supplied], [ADDRESSES.ethereum.USDC, aUsdcBalance], [ADDRESSES.ethereum.WBTC, -BigInt(debt)]],
  // WBTC collateral, minus the loan token borrowed against it, plus that loan
  // token deployed to the venue vault.
  MORPHOCARRY: ({ morpho, vaultAsset, vaultAmount }) =>
    [[morpho.collateralToken, morpho.collateral], [morpho.loanToken, -morpho.borrowed], [vaultAsset, vaultAmount]],
  // Shares of the ERC-4626 vault the PM names.
  MORPHOV2: ({ vaultAsset, vaultAmount }) => [[vaultAsset, vaultAmount]],
  FLUIDLITE: ({ vaultAsset, vaultAmount }) => [[vaultAsset, vaultAmount]],
  // Stake DAO reward-vault shares, converted to the Curve LP token.
  STAKEDAO: ({ vaultAsset, vaultAmount }) => [[vaultAsset, vaultAmount]],
  // Curve LP held directly and staked in the PM's gauge (1:1 LP).
  CURVE: ({ pool, held, staked }) => [[pool, held], [pool, staked]],
  // YieldBasis LT shares redeemed at the LT's preview_withdraw.
  YIELDBASIS: ({ asset, shares, redeemed }) => BigInt(shares) === 0n ? [] : [[asset, redeemed]],
  // sUSDS and syrupUSDC are counted by the balanceOf sweep.
  SUSDS: () => [],
  UNIV4SWAP: () => [],
};

/**
 * Values the strategy position managers and adds their holdings. Reads are
 * batched across strategies: one multicall per getter / read kind instead of
 * one call per strategy. A strategy with no valuer, a missing venue entry, or
 * a reverting read is logged and skipped so the rest of the chain's TVL still
 * reports; other errors (RPC) propagate.
 */
async function addStrategyPositions(api, strategies) {
  const skipped = new Map();
  const skip = (s, reason = 'read reverted') => { if (!skipped.has(s)) skipped.set(s, reason); };
  const of = (...protocols) => strategies.filter((s) => protocols.includes(s.protocol) && !skipped.has(s));
  // Runs calls[i] for list[i] in one multicall and stores each result on its
  // strategy under `key`; a reverting read skips that strategy only.
  const read = async (list, key, readAbi, toCall) => {
    if (!list.length) return;
    const res = await api.multiCall({ abi: readAbi, calls: list.map(toCall), permitFailure: true });
    list.forEach((s, i) => (res[i] == null ? skip(s) : (s[key] = res[i])));
  };
  const self = (s) => s.target;

  strategies.forEach((s) => {
    if (!VALUERS[s.protocol]) return skip(s, 'no valuation');
    if (s.protocol === 'STAKEDAO') {
      s.vault = STAKEDAO_VAULTS[s.investment];
      if (!s.vault) skip(s, 'no vault in STAKEDAO_VAULTS');
    }
    if (s.protocol === 'MORPHOCARRY') {
      const venue = MORPHOCARRY_VENUES[s.investment];
      if (!venue) return skip(s, 'no venue in MORPHOCARRY_VENUES');
      s.marketId = venue.marketId;
      s.vault = venue.vault;
    }
  });

  // venue addresses the position managers name themselves
  await read(of('MORPHOBLUE', 'AAVECARRY'), 'marketId', abi.MARKET_ID, self);
  await read(of('AAVECARRY'), 'aUsdc', abi.A_USDC, self);
  await read(of('AAVECARRY'), 'debtWbtc', abi.VARIABLE_DEBT_WBTC, self);
  await read(of('MORPHOV2', 'FLUIDLITE'), 'vault', abi.VAULT, self);
  await read(of('CURVE'), 'pool', abi.POOL, self);
  await read(of('CURVE'), 'gauge', abi.gauge, self);
  await read(of('YIELDBASIS'), 'lt', abi.LT, self);
  await read(of('YIELDBASIS'), 'asset', abi.ASSET, self);

  // Morpho Blue positions
  const MORPHO = ['MORPHOBLUE', 'AAVECARRY', 'MORPHOCARRY'];
  await read(of(...MORPHO), 'morphoPos', abi.morphoPosition, (s) => ({ target: MORPHO_BLUE, params: [s.marketId, s.target] }));
  await read(of(...MORPHO), 'morphoMarket', abi.morphoMarket, (s) => ({ target: MORPHO_BLUE, params: [s.marketId] }));
  await read(of(...MORPHO), 'morphoParams', abi.morphoMarketParams, (s) => ({ target: MORPHO_BLUE, params: [s.marketId] }));
  of(...MORPHO).forEach((s) => { s.morpho = morphoPosition(s.morphoPos, s.morphoMarket, s.morphoParams); });

  // every balanceOf any strategy needs: [protocols, token field, result field]
  const VAULTS = ['MORPHOV2', 'FLUIDLITE', 'STAKEDAO', 'MORPHOCARRY'];
  const balanceReads = [
    [VAULTS, 'vault', 'vaultShares'],
    [['AAVECARRY'], 'aUsdc', 'aUsdcBalance'],
    [['AAVECARRY'], 'debtWbtc', 'debt'],
    [['CURVE'], 'pool', 'held'],
    [['CURVE'], 'gauge', 'staked'],
    [['YIELDBASIS'], 'lt', 'shares'],
  ].flatMap(([protocols, tokenKey, key]) => of(...protocols).map((s) => ({ s, token: s[tokenKey], key })));
  if (balanceReads.length) {
    const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: balanceReads.map(({ s, token }) => ({ target: token, params: [s.target] })), permitFailure: true });
    balanceReads.forEach(({ s, key }, i) => (balances[i] == null ? skip(s) : (s[key] = balances[i])));
  }

  // ERC-4626 shares converted through the vault's own convertToAssets
  await read(of(...VAULTS), 'vaultAsset', abi.asset, (s) => s.vault);
  await read(of(...VAULTS), 'vaultAmount', abi.convertToAssets, (s) => ({ target: s.vault, params: [s.vaultShares] }));
  await read(of('YIELDBASIS').filter((s) => BigInt(s.shares) > 0n), 'redeemed', abi.previewWithdraw, (s) => ({ target: s.lt, params: [s.shares] }));

  strategies.forEach((s) => {
    if (skipped.has(s)) return sdk.log(`btcd: skipped ${s.typ} at ${s.target}: ${skipped.get(s)}`);
    VALUERS[s.protocol](s).forEach(([token, amount]) => api.add(token, amount));
  });
}

/**
 * Adds the YieldBasis hybrid vault's LT shares, each redeemed at its LT's
 * preview_withdraw. The vault's scrvUSD is counted by the balanceOf sweep.
 */
async function addYieldBasisHybrid(api) {
  const ltShares = await api.multiCall({ abi: 'erc20:balanceOf', calls: YB_HYBRID_LTS.map((lt) => ({ target: lt, params: [YB_HYBRID_VAULT] })) });
  const held = YB_HYBRID_LTS.map((lt, i) => [lt, ltShares[i]]).filter(([, shares]) => BigInt(shares) > 0n);
  if (!held.length) return;
  const assets = await api.multiCall({ abi: abi.ltAsset, calls: held.map(([lt]) => lt) });
  const amounts = await api.multiCall({ abi: abi.previewWithdraw, calls: held.map(([lt, shares]) => ({ target: lt, params: [shares] })) });
  api.add(assets, amounts);
}

/**
 * Computes BTCD's Ethereum-mainnet TVL.
 *
 * Steps:
 *   1. Discover the strategy position managers from the engine Multicall's
 *      authorized targets and value each by its TYP protocol.
 *   2. balanceOf sweep of idle tokens over the strategy position managers and
 *      the static custody contracts.
 *   3. YieldBasis hybrid vault LT shares.
 *
 * Off-chain Fireblocks/CEX balances and EOAs are intentionally excluded.
 */
async function ethereumTvl(api) {
  const targets = await api.call({ target: ENGINE_MULTICALL, abi: abi.getAuthorizedTargets });
  const typs = await api.multiCall({ abi: abi.TYP, calls: targets, permitFailure: true });
  const strategies = targets
    .map((target, i) => ({ target, typ: typs[i] }))
    .filter(({ typ }) => typ)
    .map((s) => {
      const [protocol, investment] = s.typ.split(':');
      return { ...s, protocol, investment };
    });

  await addStrategyPositions(api, strategies);
  await sumTokens2({ api, owners: [...STATIC_CUSTODY, ...strategies.map(({ target }) => target)], tokens: idleTokens });
  await addYieldBasisHybrid(api);
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
  const longToken = await api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function LONG_TOKEN() view returns (address)' });
  const shortToken = await api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function SHORT_TOKEN() view returns (address)' });
  const gmToken = await api.call({ target: ARBITRUM_GM_POSITION_MANAGER, abi: 'function GM_TOKEN() view returns (address)' });

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
  doublecounted: true,
  methodology:
    'On-chain collateral across the protocol\'s custody contracts and strategy ' +
    'position managers. Strategies are discovered from the engine Multicall\'s ' +
    'authorized targets and valued by protocol: Morpho Blue supply, ERC-4626 ' +
    'vault shares (Morpho V2, Fluid Lite, Stake DAO reward vaults over Curve ' +
    'LP), Curve LP and gauges, YieldBasis LT shares, and Aave and Morpho ' +
    'carry trades net of their debt. Idle reserves are read by balanceOf. ' +
    'The YieldBasis hybrid vault and the Arbitrum GMX V2 sleeve are read ' +
    'explicitly. Off-chain custody and EOAs are not included. Collateral is ' +
    'deployed into Morpho, Stake DAO, Curve, Fluid, Aave and YieldBasis, so ' +
    'it is marked double counted.',
  ethereum: { tvl: ethereumTvl },
  arbitrum: { tvl: arbitrumTvl },
};
