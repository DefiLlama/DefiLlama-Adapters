const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: async (timestamp) => {
      const api = new sdk.ChainApi({ timestamp, chain: 'bsc' })
      await api.getBlock()
      return {
        [nullAddress]: await api.call({ target: '0x250632378e573c6be1ac2f97fcdf00515d0aa91b', abi: 'uint256:totalSupply'})
      }
    }
  }
}