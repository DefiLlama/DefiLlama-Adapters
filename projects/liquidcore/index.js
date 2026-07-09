const ADDRESSES = require('../helper/coreAssets.json')

const ROUTER = '0x625aC1D165c776121A52ff158e76e3544B4a0b8B'
const ROUTER_FROM_BLOCK = 28736539
const LEGACY_POOLS = [
  '0xA7478A5ff7cB27A8008D6D90785db10223bc6087',
  '0xD3994A6CF46cA91536376f89aCDadf92eD289a9F',
]

async function tvl(api) {
  const pools = [...LEGACY_POOLS]
  if (await api.getBlock() >= ROUTER_FROM_BLOCK) {
    const registered = await api.call({ target: ROUTER, abi: 'address[]:getPools' })
    for (const pool of registered)
      if (pool !== ADDRESSES.null && !pools.includes(pool)) pools.push(pool)
  }
  const tokens = await api.multiCall({
    abi: 'function getTokens() view returns (address token0, address token1)',
    calls: pools,
  })
  const tokensAndOwners = []
  pools.forEach((pool, i) => {
    if (!tokens[i]) return
    tokensAndOwners.push([tokens[i].token0, pool], [tokens[i].token1, pool])
  })
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'Total value of all coins held in the LiquidCore pool contracts.',
  start: '2025-11-09', // first LiquidCore pool (USD₮0/WHYPE) deployment
  hyperliquid: { tvl },
}
