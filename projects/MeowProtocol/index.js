const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: '0x9aE578d5ad69B051E6FbC7EBB18A12C2D459D914',
  scroll: '0x4b71CAF14Cf8529101498976C44B8445797A5886'
}

Object.keys(config).forEach(chain => {
  const lendingPoolCore = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getReserves', target: lendingPoolCore })
      return sumTokens2({api, tokens, owner: lendingPoolCore })
    },
    borrowed: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getReserves', target: lendingPoolCore })
      const bals = await api.multiCall({ abi: "function getReserveTotalBorrows(address _reserve) view returns (uint256)", target: lendingPoolCore, calls: tokens })
      api.add(tokens, bals)
      return api.getBalances()
    }
  }
})