const { sumTokens2 } = require("../helper/unwrapLPs")
const { getUniqueAddresses, } = require("../helper/utils")
const uniswapAbi = require("../helper/abis/uniswap")
const sdk = require('@defillama/sdk')

const config = {
  polygon: { orderBook: '0x5D36b36c53438C0fb70DCA5082EE5BDe25Bd888B', factory: '0x3ee4154c7f42d94e1092ad8ce5debb4b743ed0b2'},
  moonbeam: { orderBook: '0x75037b5D3B0bC1f28748918579BF35B68d01ebD3', factory: '0xdd760d04200c40e8dbBa158A860D4C872a6E3C35'},
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const {orderBook, factory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { chain, block} = api
      const balances = {}
      const calls = await api.fetchList({ lengthAbi: uniswapAbi.allPairsLength, itemAbi: uniswapAbi.allPairs, target: factory })
      const token0s = await api.multiCall({ abi: uniswapAbi.token0, calls })
      const token1s = await api.multiCall({ abi: uniswapAbi.token1, calls })
      const reserves = await api.multiCall({ abi: uniswapAbi.getReserves, calls })
      reserves.forEach(({ _reserve0, _reserve1}, i) => {
        sdk.util.sumSingleBalance(balances,token0s[i],_reserve0, chain)
        sdk.util.sumSingleBalance(balances,token1s[i],_reserve1, chain)
      })
      const tokens = [...token0s, ...token1s]
    
      return sumTokens2({
        chain, block, owner: orderBook, tokens: getUniqueAddresses(tokens), balances,
      })
    },
  }
})
