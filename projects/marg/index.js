const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

// Marg DEX (marg.lol): concentrated-liquidity AMM on TON with native TON as the quote asset.
// Pool list and current reserves come from the Marg indexer, which replays every pool event on-chain.
// Contract source: https://github.com/imfromthefuture/marg
const API = 'https://marg.lol/api/idx/defillama/pools'

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'TVL is the sum of the reserves held by all active Marg DEX pools. Launchpad tokens are valued only through their TON side.',
  ton: {
    tvl: async () => {
      const { pools } = await get(API)
      return transformDexBalances({
        chain: 'ton',
        data: pools.map(p => ({
          token0: p.token0,
          token1: p.token1,
          token0Bal: p.reserve0,
          token1Bal: p.reserve1,
        })),
      })
    },
  },
}
