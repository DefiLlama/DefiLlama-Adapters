const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const token = '0xa2E3356610840701BDf5611a53974510Ae27E2e1'

module.exports = {
  ethereum: {
    tvl: async (_, block) => ({
      ["ethereum:" + ADDRESSES.null]: (await sdk.api.erc20.totalSupply({ target: token, block})).output
    })
  },
  bsc: {
    tvl: async (_, block, chainBlocks) => ({
      ["bsc:" + ADDRESSES.bsc.ETH]: (await sdk.api.erc20.totalSupply({ target: token, chain:"bsc", block: chainBlocks.bsc})).output
    })
  }
}
