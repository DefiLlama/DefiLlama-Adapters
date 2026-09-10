const ADDRESSES = require('../helper/coreAssets.json')
const RPC_URL          = 'https://noderpc.strato.nexus/rpc'
const POOL_FACTORY     = '0x000000000000000000000000000000000000100a'
const CDP_REGISTRY     = '0x0000000000000000000000000000000000001012'
const LENDING_REGISTRY = '0x0000000000000000000000000000000000001007'
const LENDING_POOL     = '0x0000000000000000000000000000000000001005'
const SAFETY_MODULE    = '0x0000000000000000000000000000000000001015'
const SAVE_USDST_VAULT = '0x22550671fcad04a213697ac7ae4f4366e96446ed'
const VAULT            = '0x34bc729f66106a146b0864e673a3571b28fa23e1'
const STRATO_STAKING   = '0xf30a022ce83bed7adeafc286c719388dcc3b3988'
// $STRATO is not priced on the STRATO chain itself. CoinGecko tracks it as the
// Ethereum ERC-20 (`ethereum-strato`), same 18 decimals, so staked balance is
// reported against that address.
const STRATO_ON_ETHEREUM = 'ethereum:0x4c93b9fbf7fd1777ccbcbc538b1d0a8b58fb1ad6'
const POOL_V3_FACTORY  = '0x5d630126d908b46bcf8d00bc15e591a459375809'
// DirectMintPSM: mints USDST 1:1 against stablecoin reserves it holds.
const DIRECT_MINT_PSM  = '0xb1efdc86eecfbedf83d0295671214fee451786f3'
// ERC-4626 YieldVaults. There is no on-chain factory/registry to enumerate
// them, so initialized vaults are listed explicitly. `asset()` is read on-chain.
const YIELD_VAULTS = [
  '0xafcfc4d847d59fbc402856fd6934aff6796812b1', // yieldUSDC
  '0xa94905d8bd117e9bfbe57aadffd7abbea760e028', // carryETH
  '0x0b5831edcab6f06256a790340426236c31bb463f', // carryWBTC
  '0xddf7c27f27ac43b25043e100c2076e515526b9ae', // yieldGOLDST
  '0xf8884c44d7cfbfb7c6326c515f375f8572f03e2b', // yieldSILVST
]

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
    let tokens
    // StablePool can hold more than two coins (e.g. USDT-USDC-USDST). tokenA/tokenB
    // only expose the first two, so enumerate the full `coins` array instead.
    let isStable = false
    try { isStable = await api.call({ target: pool, abi: 'function isStable() view returns (bool)' }) } catch { /* legacy pool */ }
    if (isStable) {
      const n = Number(await api.call({ target: pool, abi: 'function getNumCoins() view returns (uint256)' }))
      tokens = []
      for (let i = 0; i < n; i++) {
        tokens.push((await api.call({ target: pool, abi: 'function coins(uint256) view returns (address)', params: i })).toLowerCase())
      }
    } else {
      const tokenA = (await api.call({ target: pool, abi: 'function tokenA() view returns (address)' })).toLowerCase()
      const tokenB = (await api.call({ target: pool, abi: 'function tokenB() view returns (address)' })).toLowerCase()
      tokens = [tokenA, tokenB]
    }
    pools.push({ pool, tokens: [...new Set(tokens)] })
  }
  return pools
}

// Concentrated-liquidity (Uniswap-v3 style) pools. Token balances held by the
// pool contract are the TVL; positions are accounted inside the pool.
async function discoverV3Pools(api) {
  const poolAddrs = await enumerateArray(
    api, POOL_V3_FACTORY, 'function allPools(uint256) view returns (address)'
  )
  const pools = []
  for (const pool of poolAddrs) {
    const token0 = (await api.call({ target: pool, abi: 'function token0() view returns (address)' })).toLowerCase()
    const token1 = (await api.call({ target: pool, abi: 'function token1() view returns (address)' })).toLowerCase()
    pools.push({ pool, tokens: [token0, token1] })
  }
  return pools
}

async function tvl(api) {
  const pools = [...await discoverPools(api), ...await discoverV3Pools(api)]

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

  // PSM reserves. Accepted tokens live in a non-enumerable mapping, so check
  // every token the adapter already knows about.
  for (const token of allTokens) pairs.push({ holder: DIRECT_MINT_PSM, token })

  // YieldVaults: count only assets idle in the vault contract. `deployedAssets`
  // is capital handed to strategy wallets that redeploy it into CDPs / pools on
  // STRATO, where it is already counted above. Counting it here would double count.
  for (const vault of YIELD_VAULTS) {
    const asset = (await api.call({ target: vault, abi: 'function asset() view returns (address)' })).toLowerCase()
    pairs.push({ holder: vault, token: asset })
  }

  for (const { token, holder } of pairs) {
    const balance = await api.call({ target: token, abi: 'erc20:balanceOf', params: holder })
    if (BigInt(balance) > 0n) api.add(token, balance.toString())
  }

  const saveTotalAssets   = await api.call({ target: SAVE_USDST_VAULT, abi: 'function totalAssets() view returns (uint256)' })
  const safetyTotalAssets = await api.call({ target: SAFETY_MODULE,    abi: 'function totalAssets() view returns (uint256)' })

  if (BigInt(saveTotalAssets)   > 0n) api.add(saveAsset,   saveTotalAssets.toString())
  if (BigInt(safetyTotalAssets) > 0n) api.add(safetyAsset, safetyTotalAssets.toString())
}

async function borrowed(api) {
  const borrowableAsset  = await api.call({ target: LENDING_POOL, abi: 'function borrowableAsset() view returns (address)' })
  const borrowIndex      = await api.call({ target: LENDING_POOL, abi: 'function borrowIndex() view returns (uint256)' })
  const totalScaledDebt  = await api.call({ target: LENDING_POOL, abi: 'function totalScaledDebt() view returns (uint256)' })

  const lendingDebt = (BigInt(totalScaledDebt) * BigInt(borrowIndex)) / RAY
  if (lendingDebt > 0n) api.add(borrowableAsset, lendingDebt.toString())

  // CDP debt. `totalDebtAll` sums outstanding USDST across every enumerated
  // collateral asset, using the stored rateAccumulator so the call has no accrual
  // side effects. Returns WAD (18 decimals), matching USDST.
  const cdpEngine = await api.call({ target: CDP_REGISTRY, abi: 'function cdpEngine() view returns (address)' })
  const usdst     = await api.call({ target: CDP_REGISTRY, abi: 'function usdst() view returns (address)' })
  const cdpDebt   = await api.call({ target: cdpEngine,    abi: 'function totalDebtAll() view returns (uint256)' })
  if (BigInt(cdpDebt) > 0n) api.add(usdst, cdpDebt.toString())
}

// Phase 1 $STRATO staking. There is no receipt token; stake is tracked as
// internal accounting on StratoStaking. Principal = delegated user stake +
// operator self-bond. Unbonding stake and the reward reserve are excluded.
async function staking(api) {
  const totalUserStake = await api.call({ target: STRATO_STAKING, abi: 'function totalUserStake() view returns (uint256)' })
  const totalSelfBond  = await api.call({ target: STRATO_STAKING, abi: 'function totalSelfBond() view returns (uint256)' })
  const staked = BigInt(totalUserStake) + BigInt(totalSelfBond)
  if (staked > 0n) api.add(STRATO_ON_ETHEREUM, staked.toString(), { skipChain: true })
}

module.exports = {
  methodology:
    'All values verified on-chain via sequential eth_call (no Multicall3). Swap pools enumerated from PoolFactory.allPools and PoolV3Factory.allPools (concentrated liquidity); StablePool coins enumerated via getNumCoins/coins so multi-coin pools are fully counted. CDP collateral read from CDPVault, lending deposits (idle liquidity + collateral) from LiquidityPool + CollateralVault, savings from SaveUSDSTVault, staked assets from SafetyModule, vault holdings from the Vault botExecutor, stablecoin reserves held by the DirectMintPSM, and idle assets held by each ERC-4626 YieldVault (capital deployed to strategies is excluded because it is redeployed into CDPs/pools already counted). Holder addresses resolved from on-chain registries (CDPRegistry, LendingRegistry). Outstanding debt is reported separately under `borrowed` and excluded from TVL: LiquidityPool debt (totalScaledDebt × borrowIndex / RAY against the LiquidityPool borrowableAsset) plus CDP debt (CDPEngine.totalDebtAll, outstanding USDST summed across every enumerated collateral asset). Staked $STRATO (StratoStaking totalUserStake + totalSelfBond) is reported under `staking`, priced against the Ethereum STRATO ERC-20 because $STRATO has no price feed on the STRATO chain itself. Prices resolved server-side by DefiLlama for the `strato` chain.',
  misrepresentedTokens: true,
  timetravel: false,
  start: 1775151906,
  strato: { tvl, borrowed, staking },
}
