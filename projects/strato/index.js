const ADDRESSES = require('../helper/coreAssets.json')
const RPC_URL          = 'https://noderpc.strato.nexus/rpc'
const POOL_FACTORY     = '0x000000000000000000000000000000000000100a'
const CDP_REGISTRY     = '0x0000000000000000000000000000000000001012'
const LENDING_REGISTRY = '0x0000000000000000000000000000000000001007'
const LENDING_POOL     = '0x0000000000000000000000000000000000001005'
const SAFETY_MODULE    = '0x0000000000000000000000000000000000001015'
const SAVE_USDST_VAULT = '0x22550671fcad04a213697ac7ae4f4366e96446ed'
const VAULT            = '0x34bc729f66106a146b0864e673a3571b28fa23e1'

if (!process.env.STRATO_RPC) process.env.STRATO_RPC = RPC_URL

const RAY = 10n ** 27n

async function enumerateArray(api, target, abi, max = 500) {
  const seen = new Set()
  const out = []
  for (let i = 0; i < max; i++) {
    let r
    try { r = await api.call({ target, abi, params: i }) } catch { break }
    if (!r || r === ADDRESSES.null) break
    const lc = r.toLowerCase()
    if (!seen.has(lc)) { seen.add(lc); out.push(lc) }
  }
  if (out.length === max) console.warn(`[strato] enumerateArray hit cap ${max} on ${target} — likely truncated`)
  return out
}

async function discoverPools(api) {
  const poolAddrs = await enumerateArray(
    api, POOL_FACTORY, 'function allPools(uint256) view returns (address)'
  )
  const pools = []
  for (const pool of poolAddrs) {
    const tokenA = (await api.call({ target: pool, abi: 'function tokenA() view returns (address)' })).toLowerCase()
    const tokenB = (await api.call({ target: pool, abi: 'function tokenB() view returns (address)' })).toLowerCase()
    pools.push({ pool, tokens: [tokenA, tokenB] })
  }
  return pools
}

async function tvl(api) {
  const pools = await discoverPools(api)

  const cdpVault         = (await api.call({ target: CDP_REGISTRY,     abi: 'function cdpVault() view returns (address)' })).toLowerCase()
  const collateralVault  = (await api.call({ target: LENDING_REGISTRY, abi: 'function collateralVault() view returns (address)' })).toLowerCase()
  const liquidityPool    = (await api.call({ target: LENDING_REGISTRY, abi: 'function liquidityPool() view returns (address)' })).toLowerCase()
  const borrowableAsset  = (await api.call({ target: LENDING_POOL,     abi: 'function borrowableAsset() view returns (address)' })).toLowerCase()
  const lendingCollateralTokens = await enumerateArray(
    api, LENDING_POOL, 'function configuredAssets(uint256) view returns (address)'
  )

  const vaultBotExecutor = (await api.call({ target: VAULT, abi: 'function botExecutor() view returns (address)' })).toLowerCase()
  const vaultAssets      = await enumerateArray(api, VAULT, 'function supportedAssets(uint256) view returns (address)')

  const saveAsset        = (await api.call({ target: SAVE_USDST_VAULT, abi: 'function asset() view returns (address)' })).toLowerCase()
  const safetyAsset      = (await api.call({ target: SAFETY_MODULE,    abi: 'function asset() view returns (address)' })).toLowerCase()

  const tokenSet = new Set()
  pools.forEach(p => p.tokens.forEach(t => tokenSet.add(t)))
  lendingCollateralTokens.forEach(t => tokenSet.add(t))
  vaultAssets.forEach(t => tokenSet.add(t))
  tokenSet.add(borrowableAsset)
  tokenSet.add(saveAsset)
  tokenSet.add(safetyAsset)
  const allTokens = [...tokenSet]

  const pairs = []
  for (const { pool, tokens } of pools) {
    for (const token of tokens) pairs.push({ holder: pool, token })
  }
  for (const token of allTokens) pairs.push({ holder: cdpVault, token })
  for (const token of lendingCollateralTokens) pairs.push({ holder: collateralVault, token })
  pairs.push({ holder: liquidityPool, token: borrowableAsset })
  for (const token of vaultAssets) pairs.push({ holder: vaultBotExecutor, token })

  for (const { token, holder } of pairs) {
    const balance = await api.call({ target: token, abi: 'erc20:balanceOf', params: holder })
    if (BigInt(balance) > 0n) api.add(token, balance.toString())
  }

  const saveTotalAssets   = await api.call({ target: SAVE_USDST_VAULT, abi: 'function totalAssets() view returns (uint256)' })
  const safetyTotalAssets = await api.call({ target: SAFETY_MODULE,    abi: 'function totalAssets() view returns (uint256)' })

  if (BigInt(saveTotalAssets)   > 0n) api.add(saveAsset,   saveTotalAssets.toString())
  if (BigInt(safetyTotalAssets) > 0n) api.add(safetyAsset, safetyTotalAssets.toString())
}

// NOTE: CDP debt is intentionally NOT included here. STRATO's CDPEngine stores
// per-collateral debt in `mapping(address => CollateralGlobalState) public record
// collateralGlobalStates`, and the `record` modifier prevents the standard ABI
// auto-getter from being exposed via eth_call (selector reverts with "no function
// for selector"). Reading CDP debt over JSON-RPC requires either an explicit
// external view getter on CDPEngine or a contract redeploy. Until that lands,
// `borrowed` reports only the LiquidityPool debt.
async function borrowed(api) {
  const borrowableAsset  = await api.call({ target: LENDING_POOL, abi: 'function borrowableAsset() view returns (address)' })
  const borrowIndex      = await api.call({ target: LENDING_POOL, abi: 'function borrowIndex() view returns (uint256)' })
  const totalScaledDebt  = await api.call({ target: LENDING_POOL, abi: 'function totalScaledDebt() view returns (uint256)' })

  const lendingDebt = (BigInt(totalScaledDebt) * BigInt(borrowIndex)) / RAY
  if (lendingDebt > 0n) api.add(borrowableAsset, lendingDebt.toString())
}

module.exports = {
  methodology:
    'All values verified on-chain via sequential eth_call (no Multicall3). Swap pools enumerated from PoolFactory.allPools. CDP collateral read from CDPVault, lending deposits (idle liquidity + collateral) from LiquidityPool + CollateralVault, savings from SaveUSDSTVault, staked assets from SafetyModule, and vault holdings from the Vault botExecutor. Holder addresses resolved from on-chain registries (CDPRegistry, LendingRegistry). Outstanding LiquidityPool debt is reported separately under `borrowed` (totalScaledDebt × borrowIndex / RAY against the LiquidityPool borrowableAsset) and is excluded from TVL. CDP debt is not yet included because STRATO CDPEngine state mappings are not exposed via standard ABI auto-getters over eth_call; this will be added once an explicit on-chain view function is available. Prices resolved server-side by DefiLlama for the `strato` chain.',
  misrepresentedTokens: true,
  timetravel: false,
  start: 1775151906,
  strato: { tvl, borrowed },
}
