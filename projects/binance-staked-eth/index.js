const ADDRESSES = require('../helper/coreAssets.json')
const target = ADDRESSES.bsc.wBETH

module.exports = {
  ethereum: {
    tvl: async (api) => ({
      ["ethereum:" + ADDRESSES.null]: (
        await api.call({ target, abi: 'erc20:totalSupply' })
      ) * (
        await api.call({ target, abi: "uint256:exchangeRate" })
      ) / 1e18
    })
  },
  bsc: {
    tvl: async (api) => ({
      ["bsc:" + ADDRESSES.bsc.ETH]: (
        await api.call({ target, abi: 'erc20:totalSupply' })
      ) * (
        await api.call({ target, abi: "uint256:exchangeRate" })
      ) / 1e18
    })
  }
}
