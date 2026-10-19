const S = require('../helper/chain/substrate')

const CHAIN = 'hydration'

// Omnipool constants
const omnipoolAccountId = "7L53bUTBbfuj14UpdCNPwmgzzHSsrsTWBHX5pys32mVWM3C1"

const cgMapping = {
  DAI: 'dai',
  // INTR: 'interlay',
  GLMR: 'moonbeam',
  vDOT: 'voucher-dot',
  ZTG: 'zeitgeist',
  CFG: 'centrifuge',
  BNC: 'bifrost-native-coin',
  WETH: 'ethereum',
  DOT: 'polkadot',
  APE: 'apecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  ASTR: 'astar',
  WBTC: 'wrapped-bitcoin',
  // iBTC: 'interbtc',
  HDX: 'hydradx',
  tBTC: 'tbtc',
  AAVE: 'aave',
  PHA: 'pha',
  vASTR: 'bifrost-voucher-astr',
  KSM: 'kusama',
  KILT: 'kilt-protocol',
  SKY: 'sky',
  LINK: 'chainlink',
  SOL: 'solana',
  CRU: 'crust-network',
  RING: 'darwinia-network-native-token',
  EWT: 'energy-web-token',
  UNQ: 'unique-network',
  MYTH: 'mythos',
  WUD: 'gawun-wud',
  ETH: 'ethereum',
  SUB: 'subsocial',
  NODL: 'nodle-network',
  PLMC: 'polimec',
  AJUN: 'ajuna-network',
  TRAC: 'origintrail',
  NEURO: 'neurowebai',
  SQD: 'subsquid',
  ENA: 'ethena',
  PAXG: 'pax-gold',
  jitoSOL: 'jito-staked-sol',
  EURC: 'euro-coin',
  PRIME: 'hastra-prime',
  LAOS: 'laos-network',
  wstETH: 'wrapped-steth',
  LBTC: 'lombard-staked-btc',
  sUSDe: 'ethena-staked-usde',
  sUSDS: 'susds',
  HOLLAR: 'hydrated-dollar',
  PEN: 'pendulum-chain',
  // GDOT: 'gigadot' // skip for doublecount
};

// Everything is read from chain state over HTTP JSON-RPC - the Hydration indexer
// (orca-main-aggr-indx.indexer.hydration.cloud) has extended outages.

// AssetRegistry AssetType enum
const ASSET_TYPE_ERC20 = 5

// Stableswap.Pools: map Blake2_128Concat u32 pool_id => PoolInfo
// Pool account = blake2_256("sts" ++ u32_le(pool_id)) - see StableswapAccountIdConstructor
// and POOL_IDENTIFIER in galacticcouncil/hydration-node.
async function fetchStablepoolAccounts() {
  const pools = await S.getStorageEntries(CHAIN, { pallet: 'Stableswap', item: 'Pools' })
  return pools.map(({ rest }) => S.blake2_256(Buffer.concat([Buffer.from('sts'), S.stripHasher(rest, 'Blake2_128Concat').subarray(0, 4)])))
}

// AssetRegistry.Assets: map Blake2_128Concat u32 asset_id => AssetDetails
// AssetDetails { name: Option<BoundedVec<u8>>, asset_type: AssetType, existential_deposit: u128, symbol: Option<BoundedVec<u8>>, decimals: Option<u8>, xcm_rate_limit: Option<u128>, is_sufficient: bool }
async function fetchAssetMetadata() {
  const entries = await S.getStorageEntries(CHAIN, { pallet: 'AssetRegistry', item: 'Assets' })
  const assets = []
  for (const { rest, value } of entries) {
    const assetId = S.stripHasher(rest, 'Blake2_128Concat').readUInt32LE(0)
    if (assetId === 0) continue // HDX, handled separately
    const r = new S.ScaleReader(value)
    r.option(() => r.bytesVec()) // name
    const assetType = r.u8()
    r.u128() // existential deposit
    const symbol = r.option(() => r.string())
    const decimals = r.option(() => r.u8())
    if (!symbol || decimals == null) continue
    assets.push({ assetId, symbol, decimals, isErc20: assetType === ASSET_TYPE_ERC20 })
  }
  return assets
}

// XYK.PoolAssets: map Blake2_128Concat AccountId => (u32, u32)
async function fetchXykPools() {
  const pools = await S.getStorageEntries(CHAIN, { pallet: 'XYK', item: 'PoolAssets' })
  return pools.map(({ rest, value }) => {
    const r = new S.ScaleReader(value)
    return { poolAccount: S.stripHasher(rest, 'Blake2_128Concat').subarray(0, 32), assetIdA: r.u32(), assetIdB: r.u32() }
  })
}

// free balances for [{ asset, account }] pairs
// orml tokens are read in one storage batch; Erc20 assets live in EVM state so they go through the CurrenciesApi runtime call
async function fetchFreeBalances(pairs) {
  const out = new Array(pairs.length).fill(0n)
  const tokenIdx = [], erc20Idx = []
  pairs.forEach((p, i) => (p.asset.isErc20 ? erc20Idx : tokenIdx).push(i))

  const keys = tokenIdx.map(i => S.storageKey({
    pallet: 'Tokens', item: 'Accounts',
    keys: [{ hasher: 'Blake2_128Concat', key: pairs[i].account }, { hasher: 'Twox64Concat', key: S.encodeU32(pairs[i].asset.assetId) }],
  }))
  for (let c = 0; c < keys.length; c += 500) {
    const values = await S.getStorageBatch(CHAIN, keys.slice(c, c + 500))
    values.forEach((v, j) => out[tokenIdx[c + j]] = S.decodeOrmlAccountData(v).free)
  }

  for (const i of erc20Idx) {
    const { asset, account } = pairs[i]
    const res = await S.stateCall(CHAIN, 'CurrenciesApi_account', Buffer.concat([S.encodeU32(asset.assetId), account]))
    out[i] = new S.ScaleReader(res).u128()
  }
  return out
}

// Map aToken asset IDs to the underlying asset's CoinGecko ID using the on-chain
// asset registry metadata (symbols like 'aUSDT' map assetId -> cgMapping['USDT']).
function buildATokenMapping(assets) {
  const mapping = new Map();
  for (const asset of assets) {
    if (!/^a[A-Z]/.test(asset.symbol)) continue;
    const cgId = cgMapping[asset.symbol.slice(1)];
    if (cgId) mapping.set(asset, cgId);
  }
  return mapping;
}

async function tvl(api) {
  const add = (token, bal) => api.add(token, bal, { skipChain: true })

  const omnipoolAccount = S.ss58Decode(omnipoolAccountId)
  const stablepoolAccounts = await fetchStablepoolAccounts()
  const assets = await fetchAssetMetadata()
  const assetById = new Map(assets.map(a => [a.assetId, a]))

  // HDX (asset ID 0) is the native token
  const { free: hdxBalance } = await S.getSystemAccount(CHAIN, omnipoolAccountId)
  add('hydradx', Number(hdxBalance) / 1e12)

  // omnipool + stablepool balances of every mapped asset
  const poolAccounts = [omnipoolAccount, ...stablepoolAccounts]
  const pairs = []
  for (const asset of assets) {
    if (!cgMapping[asset.symbol]) continue
    for (const account of poolAccounts) pairs.push({ asset, account, cgId: cgMapping[asset.symbol] })
  }
  // aTokens held by the stablepools count as their underlying
  for (const [asset, cgId] of buildATokenMapping(assets))
    for (const account of stablepoolAccounts) pairs.push({ asset, account, cgId })

  // XYK pools
  for (const { poolAccount, assetIdA, assetIdB } of await fetchXykPools()) {
    for (const assetId of [assetIdA, assetIdB]) {
      if (assetId === 0) {
        const { free } = await S.getSystemAccount(CHAIN, poolAccount)
        add('hydradx', Number(free) / 1e12)
        continue
      }
      const asset = assetById.get(assetId)
      if (!asset || !cgMapping[asset.symbol]) continue
      pairs.push({ asset, account: poolAccount, cgId: cgMapping[asset.symbol] })
    }
  }

  const balances = await fetchFreeBalances(pairs)
  pairs.forEach(({ asset, cgId }, i) => {
    if (balances[i] > 0n) add(cgId, Number(balances[i]) / 10 ** asset.decimals)
  })

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  hydradx: { tvl },
}
