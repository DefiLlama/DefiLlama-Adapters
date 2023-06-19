const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const owner = '0x8103151E2377e78C04a3d2564e20542680ed3096'
      const totalEth = await api.call({  abi: 'uint256:getTotalEthValue', target: owner })
      api.add(nullAddress,totalEth)
    }
  },
  filecoin: {
    tvl: async (_, _1, _2, { api }) => {
      const owner = '0xe012f3957226894b1a2a44b3ef5070417a069dc2'
      const validators = await api.call({ target: owner, abi: 'function beneficiarys() public view returns (address [] memory)'})
      const bals = await api.multiCall({  abi: 'uint256:totalStakingFil', calls: validators})
      bals.forEach(i => api.add(nullAddress, i))
      return sumTokens2({ api, owners: [owner], tokens: [nullAddress]})
    }
  }
}