const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const nodeDaoView = '0xd7C049CD4ba216679ecC04Eb2767cC5E39812121'
      const totalEth = await api.call({ abi: 'uint256:getTotalTVL', target: nodeDaoView })
      api.add(nullAddress, totalEth)
    }
  }
}