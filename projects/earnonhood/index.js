const { getConfig } = require('../helper/cache')

const CHAIN_ID = 4663
const DEXES = ['uniswap', 'sushi']

const abi = {
  token0: 'address:token0',
  token1: 'address:token1',
  poolKey: 'function poolKey() view returns (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks)',
  getTotalAmounts: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1)',
}

async function getVaults(dex) {
  const data = await getConfig(
    `earnonhood/${dex}`,
    `https://api.steer.finance/getSmartPools?chainId=${CHAIN_ID}&dexName=${dex}`,
  )
  return Object.values(data.pools || {})
    .flat()
    .filter(v => v.strategyName === 'Liquid Arc Strategy' && v.vaultAddress)
    .map(v => v.vaultAddress)
}

async function tvl(api) {
  const vaults = [...new Set((await Promise.all(DEXES.map(getVaults))).flat())]
  if (!vaults.length) return

  // v4 vaults use poolKey(); v3 vaults use token0/token1
  const [poolKeys, token0s, token1s, totals] = await Promise.all([
    api.multiCall({ abi: abi.poolKey, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: abi.token0, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: abi.token1, calls: vaults, permitFailure: true }),
    api.multiCall({ abi: abi.getTotalAmounts, calls: vaults, permitFailure: true }),
  ])

  totals.forEach((t, i) => {
    if (!t) return
    const token0 = poolKeys[i]?.currency0 || token0s[i]
    const token1 = poolKeys[i]?.currency1 || token1s[i]
    if (!token0 || !token1) return
    api.add(token0, t.total0 ?? t[0])
    api.add(token1, t.total1 ?? t[1])
  })
}

module.exports = {
  methodology: 'TVL is token balances in EARN Liquid Arc vaults on Robinhood Chain, read on-chain via getTotalAmounts(). Vault list comes from Steer getSmartPools (uniswap + sushi), filtered to Liquid Arc. Doublecounted vs Uniswap/Sushi DEX TVL.',
  doublecounted: true,
  robinhood: { tvl },
}
