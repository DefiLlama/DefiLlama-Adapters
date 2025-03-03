
const ADDRESSES = require('../helper/coreAssets.json')

const token = ADDRESSES.ethereum.METH

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const stakingContract = await api.call({  abi: 'address:stakingContract', target: token})
      const bal = await api.call({  abi: 'uint256:totalControlled', target: stakingContract})
      api.add(ADDRESSES.null, bal)
      return api.getBalances()
    }
  },
}