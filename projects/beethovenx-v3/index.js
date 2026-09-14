const { getLogs } = require('../helper/cache/getLogs')

const VAULT = '0xbA1333333333a1BA1108E8412f11850A5C319bA9'
const FROM_BLOCK = 4660000

const POOL_REGISTERED =
  'event PoolRegistered(address indexed pool, address indexed factory, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenConfig, uint256 swapFeePercentage, uint32 pauseWindowEndTime, (address pauseManager, address swapFeeManager, address poolCreator) roleAccounts, (bool enableHookAdjustedAmounts, bool shouldCallBeforeInitialize, bool shouldCallAfterInitialize, bool shouldCallComputeDynamicSwapFee, bool shouldCallBeforeSwap, bool shouldCallAfterSwap, bool shouldCallBeforeAddLiquidity, bool shouldCallAfterAddLiquidity, bool shouldCallBeforeRemoveLiquidity, bool shouldCallAfterRemoveLiquidity, address hooksContract) hooksConfig, (bool disableUnbalancedLiquidity, bool enableAddLiquidityCustom, bool enableRemoveLiquidityCustom, bool enableDonation) liquidityManagement)'

const GET_POOL_TOKEN_INFO =
  'function getPoolTokenInfo(address pool) view returns (address[] tokens, (address token, uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastLiveBalances)'

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: VAULT,
    fromBlock: FROM_BLOCK,
    eventAbi: POOL_REGISTERED,
    onlyArgs: true,
    extraKey: 'PoolRegistered',
  })

  const pools = logs.map((i) => i.pool)
  const poolSet = new Set(pools.map((i) => i.toLowerCase()))

  const info = await api.multiCall({
    target: VAULT,
    abi: GET_POOL_TOKEN_INFO,
    calls: pools.map((pool) => ({ params: [pool] })),
    permitFailure: true,
  })

  const held = {}
  for (const r of info) {
    if (!r || !Array.isArray(r.tokens)) continue
    r.tokens.forEach((token, i) => {
      const bal = r.balancesRaw?.[i]
      if (bal == null) return
      const key = token.toLowerCase()
      if (poolSet.has(key)) return
      held[key] = (held[key] ?? 0n) + BigInt(bal)
    })
  }

  const tokens = Object.keys(held)
  const assets = await api.multiCall({
    abi: 'address:asset',
    calls: tokens,
    permitFailure: true,
  })

  const wrapped = []
  tokens.forEach((token, i) => {
    if (assets[i]) wrapped.push({ token, underlying: assets[i], i })
    else api.add(token, held[token].toString())
  })

  if (wrapped.length) {
    const underlyingAmounts = await api.multiCall({
      abi: 'function convertToAssets(uint256 shares) view returns (uint256)',
      calls: wrapped.map((w) => ({ target: w.token, params: [held[w.token].toString()] })),
      permitFailure: true,
    })
    wrapped.forEach((w, i) => {
      const amount = underlyingAmounts[i]
      if (amount != null) api.add(w.underlying, amount)
      else api.add(w.token, held[w.token].toString())
    })
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'Tokens held by the Balancer v3 vault on Sonic across every Beets pool it has registered, read from the vault\'s PoolRegistered logs and getPoolTokenInfo. Pool BPTs are skipped so nested pools are not double counted, and ERC-4626 tokens are converted to their underlying with convertToAssets, which is what the boosted pools hold.',
  sonic: { tvl },
}
