const sdk = require('@defillama/sdk')
const S = require('../helper/chain/substrate')
const { readCurrencyId, vToken, vToken2 } = require('../helper/chain/bifrostCurrency')
const { getEnv } = require('../helper/env')

function formatToken(token, type) {
  switch (token) {
    case `{"Token":"RMRK"}`:
      return "RMRK";
    case `{"Token":"KSM"}`:
      return "KSM";
    case `{"VSToken":"KSM"}`:
      return "vsKSM";
    case `{"VSToken2":"0"}`:
      return "vsDOT";
    case `{"VToken":"KSM"}`:
      return "vKSM";
    case `{"Token":"KAR"}`:
      return "KAR";
    case `{"Native":"BNC"}`:
      return "BNC";
    case `{"Token":"ZLK"}`:
      return "ZLK";
    case `{"Token":"MOVR"}`:
      return "MOVR";
    case `{"Stable":"KUSD"}`:
      return "KUSD";
    case `{"Token2":"0"}`:
      return type === "kusama" ? "USDT" : "DOT";
    case `{"Token2":"1"}`:
      return type === "kusama" ? "KINT" : "GLMR";
    case `{"VToken2":"0"}`:
      return "vDOT";
    case `{"VToken2":"1"}`:
      return "vGLMR";
    case `{"VToken2":"4"}`:
      return "vFIL";
    case `{"VToken2":"8"}`:
      return "vMANTA";
    case `{"VToken2":"15"}`:
      return "vETH";
    case `{"Token2":"4"}`:
      return "FIL";
    case `{"Token2":"15"}`:
      return "ETH";
    case `{"VToken2":"3"}`:
      return "vASTR";
    case `{"Token2":"3"}`:
      return "ASTR";
    case `{"Token2":"8"}`:
      return "MANTA";
    case `{"VToken":"BNC"}`:
      return "vBNC";
    case `{"VToken":"MOVR"}`:
      return "vMOVR";
    default:
      return null;
  }
}

const decimals = {
  USDT: 6,
  vDOT: 10, DOT: 10, RMRK: 10,
  vBNC: 12, BNC: 12, KSM: 12, KAR: 12, KUSD: 12,
  ETH: 18, ZLK: 18, vMOVR: 18, vGLMR: 18, MOVR: 18, GLMR: 18, FIL: 18, vFIL: 18, ASTR: 18, vASTR: 18, MANTA: 18, vMANTA: 18,
}

const tokenToCoingecko = {
  DOT: "polkadot",
  BNC: "bifrost-native-coin",
  KSM: "kusama",
  ETH: "ethereum",
  MOVR: "moonriver",
  GLMR: "moonbeam",
  KUSD: "acala-dollar",
  ZLK: "zenlink-network-token",
  USDT: "tether",
  FIL: "filecoin",
  ASTR: "astar",
  MANTA: "manta"
};

const networks = {
  kusama: { rpc: () => getEnv('BIFROST_KUSAMA_RPC'), vTokenId: (symbol) => vToken(symbol) },
  polkadot: { rpc: () => getEnv('BIFROST_POLKADOT_RPC'), vTokenId: (symbol, currency) => vToken2(currency.id) },
}

// vToken -> underlying ratio = VtokenMinting.TokenPool(vToken) / Tokens.TotalIssuance(vToken)
async function vTokenRatio(rpc, currencyId) {
  const pool = S.decodeUint(await S.getStorage(rpc, { pallet: 'VtokenMinting', item: 'TokenPool', key: currencyId }))
  const issuance = S.decodeUint(await S.getStorage(rpc, { pallet: 'Tokens', item: 'TotalIssuance', key: currencyId }))
  return issuance === 0n ? 0 : Number(pool) / Number(issuance)
}

// resolve a pool asset to its underlying symbol and the ratio to apply to its balance
async function resolveToken(network, currency) {
  const { rpc, vTokenId } = networks[network]
  const symbol = formatToken(JSON.stringify(currency.human), network)
  if (!symbol) return null
  if (symbol.startsWith('vs')) return { symbol: symbol.slice(2), ratio: 1 / 2 }
  if (symbol.startsWith('v')) return { symbol: symbol.slice(1), ratio: await vTokenRatio(rpc(), vTokenId(symbol.slice(1), currency)) }
  return { symbol, ratio: 1 }
}

// ZenlinkProtocol.PairStatuses: map Twox64Concat (AssetId, AssetId) => PairStatus { Trading(PairMetadata { pair_account, total_supply }) = 0, Bootstrap = 1, Disable = 2 }
async function getTradingPairAccounts(rpc) {
  const entries = await S.getStorageEntries(rpc, { pallet: 'ZenlinkProtocol', item: 'PairStatuses' })
  return entries.filter(({ value }) => value && S.toBuf(value)[0] === 0).map(({ value }) => S.toBuf(value).subarray(1, 33))
}

// first non-LP token held by the pair account: Tokens.Accounts(pair_account, CurrencyId)
async function getPairReserve(rpc, pairAccount) {
  const entries = await S.getStorageEntries(rpc, { pallet: 'Tokens', item: 'Accounts', keys: [{ hasher: 'Blake2_128Concat', key: pairAccount }] })
  for (const { rest, value } of entries) {
    const currency = readCurrencyId(new S.ScaleReader(S.stripHasher(rest, 'Twox64Concat')))
    if (currency.variant === 'LPToken') continue
    return { currency, free: S.decodeOrmlAccountData(value).free }
  }
}

// swap tvl: first token reserve of every trading pair, counted twice
async function addZenlinkPools(network, totalLiquidity) {
  const rpc = networks[network].rpc()
  // run pools sequentially - parallel storage prefix scans stall the RPC (queryStorageAt never responds)
  for (const pairAccount of await getTradingPairAccounts(rpc)) {
    const reserve = await getPairReserve(rpc, pairAccount)
    if (!reserve) continue
    const token = await resolveToken(network, reserve.currency)
    if (!token) { sdk.log('bifrost-dex: unmapped token', JSON.stringify(reserve.currency.human)); continue }
    totalLiquidity[token.symbol] = (totalLiquidity[token.symbol] ?? 0) + Number(reserve.free) * 2 * token.ratio
  }
}

// StableAsset.Pools: map Blake2_128Concat u32 => StableAssetPoolInfo
// { pool_id: u32, pool_asset: CurrencyId, assets: Vec<CurrencyId>, precisions: Vec<u128>, mint_fee, swap_fee, redeem_fee, total_supply, a: u128, a_block: u32, future_a: u128, future_a_block: u32, balances: Vec<u128>, ... }
async function addStablePools(network, totalLiquidity) {
  const rpc = networks[network].rpc()
  const entries = await S.getStorageEntries(rpc, { pallet: 'StableAsset', item: 'Pools' })
  for (const { value } of entries) {
    const r = new S.ScaleReader(value)
    r.u32() // pool_id
    readCurrencyId(r) // pool_asset
    const assets = r.vec(() => readCurrencyId(r))
    r.vec(() => r.u128()) // precisions
    r.u128(); r.u128(); r.u128(); r.u128() // mint_fee, swap_fee, redeem_fee, total_supply
    r.u128(); r.u32(); r.u128(); r.u32() // a, a_block, future_a, future_a_block
    const balances = r.vec(() => r.u128())

    for (const i of [0, 1]) {
      const token = await resolveToken(network, assets[i])
      if (!token) { sdk.log('bifrost-dex: unmapped stable pool token', JSON.stringify(assets[i].human)); continue }
      totalLiquidity[token.symbol] = (totalLiquidity[token.symbol] ?? 0) + Number(balances[i]) * token.ratio
    }
  }
}

async function tvl() {
  const totalLiquidity = {}
  for (const network of Object.keys(networks)) {
    await addZenlinkPools(network, totalLiquidity)
    await addStablePools(network, totalLiquidity)
  }

  const balances = {}
  for (const [symbol, amount] of Object.entries(totalLiquidity))
    balances[tokenToCoingecko[symbol]] = amount / 10 ** (decimals[symbol] ?? 12)
  return balances
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity Pools from Zenlink (only calculate the initiall Pool's liquidity).",
  bifrost: { tvl }
};
