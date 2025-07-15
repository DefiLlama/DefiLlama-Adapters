const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const token = ADDRESSES.bsc.wBETH

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
