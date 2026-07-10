const { uniTvlExports } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

const V2_FACTORY = '0xa95DA9b9fCef09A07F99444fE9304457d6ECdccA'
const V3_FACTORY = '0xea561e058313b96011e5070ca7d0f027a44e3748'

// RobinSwap runs independent V2 and V3 factories on Robinhood Chain.
// Both helpers add balances to the supplied API instance, so calling them in
// sequence produces one combined protocol TVL figure without double-counting.
const v2 = uniTvlExports({ robinhood: V2_FACTORY }, { useDefaultCoreAssets: true })
const v3 = uniV3Export({
  robinhood: {
    factory: V3_FACTORY,
    fromBlock: 6027468,
    permitFailure: true,
  },
})

module.exports = {
  methodology: 'Counts token balances held by every RobinSwap V2 pair and V3 pool on Robinhood Chain.',
  misrepresentedTokens: false,
  robinhood: {
    tvl: async (api) => {
      await v2.robinhood.tvl(api)
      await v3.robinhood.tvl(api)
    },
  },
}
