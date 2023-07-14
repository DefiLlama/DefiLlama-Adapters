const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
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