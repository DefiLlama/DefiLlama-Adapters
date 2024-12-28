const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: async ({ timestamp }) => {
      const api = new sdk.ChainApi({ timestamp, chain: 'bsc' })
      await api.getBlock()
      return {
        [nullAddress]: await api.call({ target: ADDRESSES.bsc.BETH, abi: 'uint256:totalSupply' })
      }
    }
  }
}