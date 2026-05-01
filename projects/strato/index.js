const RPC_URL          = 'https://noderpc.strato.nexus/rpc'
const POOL_FACTORY     = '0x000000000000000000000000000000000000100a'
const PRICE_ORACLE     = '0x0000000000000000000000000000000000001002'
const CDP_REGISTRY     = '0x0000000000000000000000000000000000001012'
const LENDING_REGISTRY = '0x0000000000000000000000000000000000001007'
const LENDING_POOL     = '0x0000000000000000000000000000000000001005'
const SAFETY_MODULE    = '0x0000000000000000000000000000000000001015'
const SAVE_USDST_VAULT = '0x22550671fcad04a213697ac7ae4f4366e96446ed'
const VAULT            = '0x34bc729f66106a146b0864e673a3571b28fa23e1'

if (!process.env.STRATO_RPC) process.env.STRATO_RPC = RPC_URL

const CG_TOKEN_MAP = {
  ETH: 'ethereum',
  WBTC: 'wrapped-bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  wstETH: 'wrapped-steth',
  rETH: 'rocket-pool-eth',
  PAXG: 'pax-gold',
  XAUt: 'tether-gold',
  sUSDS: 'susds',
  syrupUSDC: 'syrupusdc',
}

const WAD = 10n ** 18n
const RAY = 10n ** 27n

const lc = (v) => v && v.toLowerCase()

async function tryCall(api, opts) {
  try { return lc(await api.call(opts)) } catch { return null }
}

async function tryCallRaw(api, opts) {
  try { return await api.call(opts) } catch { return null }
}

async function enumerateArray(api, target, abi, max = 50) {
  const seen = new Set()
  const out = []
  for (let i = 0; i < max; i++) {
    const r = await tryCall(api, { target, abi, params: i })
    if (!r || r === '0x0000000000000000000000000000000000000000') break
    if (!seen.has(r)) { seen.add(r); out.push(r) }
  }
  return out
}

async function discoverPools(api) {
  const poolAddrs = await enumerateArray(
    api, POOL_FACTORY, 'function allPools(uint256) view returns (address)'
  )
  const pools = []
  for (const pool of poolAddrs) {
    const tokenA = await tryCall(api, { target: pool, abi: 'function tokenA() view returns (address)' })
    const tokenB = await tryCall(api, { target: pool, abi: 'function tokenB() view returns (address)' })
    if (tokenA && tokenB) pools.push({ pool, tokens: [tokenA, tokenB] })
  }
  return pools
}

async function tvl(api) {
  const pools = await discoverPools(api)

  const cdpVault = await tryCall(api, { target: CDP_REGISTRY, abi: 'function cdpVault() view returns (address)' })

  const collateralVault = await tryCall(api, { target: LENDING_REGISTRY, abi: 'function collateralVault() view returns (address)' })
  const liquidityPool = await tryCall(api, { target: LENDING_REGISTRY, abi: 'function liquidityPool() view returns (address)' })
  const borrowableAsset = await tryCall(api, { target: LENDING_POOL, abi: 'function borrowableAsset() view returns (address)' })
  const lendingCollateralTokens = await enumerateArray(
    api, LENDING_POOL, 'function configuredAssets(uint256) view returns (address)'
  )

  const vaultBotExecutor = await tryCall(api, { target: VAULT, abi: 'function botExecutor() view returns (address)' })
  const vaultAssets = await enumerateArray(
    api, VAULT, 'function supportedAssets(uint256) view returns (address)'
  )

  const saveAsset = await tryCall(api, { target: SAVE_USDST_VAULT, abi: 'function asset() view returns (address)' })
  const safetyAsset = await tryCall(api, { target: SAFETY_MODULE, abi: 'function asset() view returns (address)' })

  const tokenSet = new Set()
  pools.forEach(p => p.tokens.forEach(t => tokenSet.add(t)))
  lendingCollateralTokens.forEach(t => tokenSet.add(t))
  vaultAssets.forEach(t => tokenSet.add(t))
  if (borrowableAsset) tokenSet.add(borrowableAsset)
  if (saveAsset) tokenSet.add(saveAsset)
  if (safetyAsset) tokenSet.add(safetyAsset)
  const allTokens = [...tokenSet]

  const tokenInfo = new Map()
  for (const t of allTokens) {
    const symbol = await tryCallRaw(api, { target: t, abi: 'erc20:symbol' })
    const decimals = await tryCallRaw(api, { target: t, abi: 'erc20:decimals' })
    if (symbol && decimals != null) tokenInfo.set(t, { symbol, decimals: Number(decimals) })
  }

  const pairs = []
  for (const { pool, tokens } of pools) {
    for (const token of tokens) pairs.push({ holder: pool, token })
  }
  if (cdpVault) {
    for (const token of allTokens) pairs.push({ holder: cdpVault, token })
  }
  if (collateralVault) {
    for (const token of lendingCollateralTokens) pairs.push({ holder: collateralVault, token })
  }
  if (liquidityPool && borrowableAsset) {
    pairs.push({ holder: liquidityPool, token: borrowableAsset })
  }
  if (vaultBotExecutor) {
    for (const token of vaultAssets) pairs.push({ holder: vaultBotExecutor, token })
  }

  const oracleTokens = allTokens.filter(t => {
    const info = tokenInfo.get(t); return info && !CG_TOKEN_MAP[info.symbol]
  })

  const oraclePriceMap = new Map()
  for (const t of oracleTokens) {
    const price = await tryCallRaw(api, {
      target: PRICE_ORACLE,
      abi: 'function getAssetPrice(address) view returns (uint256)',
      params: t,
    })
    if (price) oraclePriceMap.set(t, BigInt(price))
  }

  const balances = []
  for (const { token, holder } of pairs) {
    balances.push(await tryCallRaw(api, { target: token, abi: 'erc20:balanceOf', params: holder }))
  }

  let borrowIndex = null, totalScaledDebt = null
  if (borrowableAsset) {
    borrowIndex = await tryCallRaw(api, { target: LENDING_POOL, abi: 'function borrowIndex() view returns (uint256)' })
    totalScaledDebt = await tryCallRaw(api, { target: LENDING_POOL, abi: 'function totalScaledDebt() view returns (uint256)' })
  }

  for (let i = 0; i < pairs.length; i++) {
    if (!balances[i]) continue
    const amount = BigInt(balances[i])
    if (amount === 0n) continue
    addToken(api, pairs[i].token, amount, tokenInfo, oraclePriceMap)
  }

  const saveTotalAssets = saveAsset
    ? await tryCallRaw(api, { target: SAVE_USDST_VAULT, abi: 'function totalAssets() view returns (uint256)' })
    : null
  const safetyTotalAssets = safetyAsset
    ? await tryCallRaw(api, { target: SAFETY_MODULE, abi: 'function totalAssets() view returns (uint256)' })
    : null

  if (saveAsset && saveTotalAssets) {
    const amt = BigInt(saveTotalAssets)
    if (amt > 0n) addToken(api, saveAsset, amt, tokenInfo, oraclePriceMap)
  }
  if (safetyAsset && safetyTotalAssets) {
    const amt = BigInt(safetyTotalAssets)
    if (amt > 0n) addToken(api, safetyAsset, amt, tokenInfo, oraclePriceMap)
  }

  if (borrowableAsset && borrowIndex && totalScaledDebt) {
    const lendingDebt = (BigInt(totalScaledDebt) * BigInt(borrowIndex)) / RAY
    if (lendingDebt > 0n) addToken(api, borrowableAsset, lendingDebt, tokenInfo, oraclePriceMap)
  }
}

function addToken(api, token, amount, tokenInfo, oraclePriceMap) {
  const info = tokenInfo.get(token)
  if (!info) return
  const scale = 10n ** BigInt(info.decimals)
  const cgId = CG_TOKEN_MAP[info.symbol]
  if (cgId) {
    api.addCGToken(cgId, Number(amount) / Number(scale))
  } else {
    const priceUsd = oraclePriceMap.get(token)
    if (!priceUsd) return
    api.addUSDValue(Number((amount * priceUsd) / scale) / Number(WAD))
  }
}

module.exports = {
  methodology:
    'All values verified on-chain via sequential eth_call (no Multicall3). Swap pools enumerated from PoolFactory.allPools. CDP collateral read from CDPVault, lending deposits from LiquidityPool + CollateralVault, savings from SaveUSDSTVault, staked assets from SafetyModule, and vault holdings from the Vault botExecutor. Holder addresses resolved from on-chain registries (CDPRegistry, LendingRegistry). Prices from CoinGecko or the on-chain PriceOracle.',
  misrepresentedTokens: true,
  timetravel: false,
  start: 1775151906,
  strato: { tvl },
}
