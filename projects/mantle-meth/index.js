
const ADDRESSES = require('../helper/coreAssets.json')

const token = '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa'

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