const { getStorageEntries, stripHasher, decodeUint } = require('../helper/chain/substrate')
const { decodeCurrencyId } = require('../helper/chain/bifrostCurrency')
const { getEnv } = require('../helper/env')

const decimals = {
  DOT: 10,
  BNC: 12, KSM: 12,
  ETH: 18, GLMR: 18, MOVR: 18, FIL: 18, ASTR: 18, MANTA: 18,
}

const tokenToCoingecko = {
  DOT: "polkadot",
  BNC: "bifrost-native-coin",
  KSM: "kusama",
  MOVR: "moonriver",
  GLMR: "moonbeam",
  ETH: "ethereum",
  FIL: "filecoin",
  ASTR: "astar",
  MANTA: "manta-network"
};

// VtokenMinting.TokenPool: map Twox64Concat CurrencyId => Balance; keys are the underlying token id (vKSM pool is keyed by VToken(KSM))
async function addTokenPools(rpc, totalLiquidity) {
  const entries = await getStorageEntries(rpc, { pallet: 'VtokenMinting', item: 'TokenPool' })
  for (const { rest, value } of entries) {
    const { symbol } = decodeCurrencyId(stripHasher(rest, 'Twox64Concat'))
    if (!symbol || !tokenToCoingecko[symbol]) continue
    totalLiquidity[symbol] = (totalLiquidity[symbol] ?? 0n) + decodeUint(value)
  }
}

let _tvl
// fetched once per run, then split across the chains the underlying tokens live on
function getAllTvl() {
  if (!_tvl) _tvl = (async () => {
    const totalLiquidity = {}
    // kusama vToken tvl (vKSM / vMOVR / vBNC)
    await addTokenPools(getEnv('BIFROST_KUSAMA_RPC'), totalLiquidity)
    // polkadot vToken tvl (vDOT / vGLMR / vASTR / ...)
    await addTokenPools(getEnv('BIFROST_POLKADOT_RPC'), totalLiquidity)

    const balances = {}
    for (const [symbol, amount] of Object.entries(totalLiquidity))
      balances[tokenToCoingecko[symbol]] = Number(amount) / 10 ** (decimals[symbol] ?? 12)
    return balances
  })()
  return _tvl
}

const pick = (...keys) => async () => {
  const all = await getAllTvl()
  return Object.fromEntries(keys.filter(k => all[k] !== undefined).map(k => [k, all[k]]))
}

module.exports = {
  timetravel: false,
  methodology: "Minted vTokens from other chains (only calculate the underlying asset value)",
  bifrost: { tvl: pick('bifrost-native-coin', 'polkadot', 'kusama', 'moonbeam', 'moonriver') },
  ethereum: { tvl: pick('ethereum') },
  astar: { tvl: pick('astar') },
  manta: { tvl: pick('manta-network') },
};
