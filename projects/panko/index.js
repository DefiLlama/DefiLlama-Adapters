const { uniV3Export } = require("../helper/uniswapV3")
const { getLogs2 } = require('../helper/cache/getLogs')
const { mergeExports } = require("../helper/utils")
const { nullAddress } = require("../helper/unwrapLPs")

const uniTvl = uniV3Export({
  taiko: { factory: '0x99960D7076297a1E0C86f3cc60FfA5d6f2B507B5', fromBlock: 433329 }
})

const stableswapConfig = {
  taiko: { factory: '0x542E849ff47da056c127F35710b01242A59705d2', fromBlock: 433341 }
}
const stableTvl = {}

Object.keys(stableswapConfig).forEach(chain => {
  const { factory, fromBlock, } = stableswapConfig[chain]
  stableTvl[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event NewStableSwapPair(address  indexed swapContract, address tokenA, address tokenB, address tokenC, address LP)',
        fromBlock,
      })
      const ownerTokens = logs.map(i => [[i.tokenA, i.tokenB, i.tokenC].filter(i => i !== nullAddress), i.swapContract])
      return api.sumTokens({ ownerTokens })
    }
  }
})

module.exports = mergeExports([uniTvl, stableTvl])