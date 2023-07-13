const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const owner = '0x8103151E2377e78C04a3d2564e20542680ed3096'
      const totalEth = await api.call({  abi: 'uint256:getTotalEthValue', target: owner })
      api.add(nullAddress,totalEth)
    }
  }
}