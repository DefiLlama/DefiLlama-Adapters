const ADDRESSES = require('../helper/coreAssets.json')

const ROUTERS = {
  hyperliquid: '0x625aC1D165c776121A52ff158e76e3544B4a0b8B',
  robinhood: '0x322F277BfB7Ba9c196194ad18011377A0fF55Fb3',
}

async function tvl(api) {
  const pools = (await api.call({ target: ROUTERS[api.chain], abi: 'address[]:getPools' }))
    .filter(pool => pool !== ADDRESSES.null)
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
  hyperliquid: {
    tvl,
    start: '2025-11-09', // first LiquidCore pool (USD₮0/WHYPE) deployment
  },
  robinhood: {
    tvl,
    start: '2026-07-14',
  },
}
