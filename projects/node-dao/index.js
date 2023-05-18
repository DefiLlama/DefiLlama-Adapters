const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const owner = '0x8103151E2377e78C04a3d2564e20542680ed3096'
      const nfts = await api.call({ target: '0x58553f5c5a6aee89eabfd42c231a18ab0872700d', abi: 'erc20:balanceOf', params: owner })
      api.add(nullAddress, nfts * 32 * 1e18)
      return sumTokens2({ api, owner, tokens: [nullAddress]})
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