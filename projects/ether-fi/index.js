const { nullAddress } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk')

module.exports = {
  ethereum: {
    tvl: async (timestamp) => {
      const api = new sdk.ChainApi({ timestamp, chain: 'optimism' })
      await api.getBlock()
      return {
        [nullAddress]: await api.call({ target: '0x6329004E903B7F420245E7aF3f355186f2432466', abi: 'uint256:getTvl'})
      }
    }
  }
}
