const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  filecoin: {
    tvl: async (api) => {
      const owner = '0xe012f3957226894b1a2a44b3ef5070417a069dc2'
      const validators = await api.call({ target: owner, abi: 'function beneficiarys() public view returns (address [] memory)'})
      const bals = await api.multiCall({  abi: 'uint256:totalStakingFil', calls: validators})
      bals.forEach(i => api.add(nullAddress, i))
      const wFILContract = "0xD9A724840a46370c01a50C1E511087ab3a07FB53"
      const totalSupply = await api.call({ target: wFILContract, abi: 'uint256:totalSupply'})
      const liquidStakingContract = "0xe012F3957226894B1a2a44b3ef5070417a069dC2"
      api.add(nullAddress, totalSupply)
      return sumTokens2({ api, owners: [owner, liquidStakingContract,], tokens: [nullAddress]})
    }
  }
}