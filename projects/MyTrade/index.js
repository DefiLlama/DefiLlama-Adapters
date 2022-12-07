const { sumTokens2 } = require("../helper/unwrapLPs")
const { getUniqueAddresses, } = require("../helper/utils")
const uniswapAbi = require("../helper/abis/uniswap")
const sdk = require('@defillama/sdk')

const orderBook = '0x5D36b36c53438C0fb70DCA5082EE5BDe25Bd888B'
const factory = '0x3ee4154c7f42d94e1092ad8ce5debb4b743ed0b2'
const chain = 'polygon'

const tvl = async (_, _b, { polygon: block }) => {
  const balances = {}
  const calls = await sdk.api2.abi.fetchList({ block, chain, lengthAbi: uniswapAbi.allPairsLength, itemAbi: uniswapAbi.allPairs, target: factory })
  const token0s = await sdk.api2.abi.multiCall({ abi: uniswapAbi.token0, chain, block, calls })
  const token1s = await sdk.api2.abi.multiCall({ abi: uniswapAbi.token1, chain, block, calls })
  const reserves = await sdk.api2.abi.multiCall({ abi: uniswapAbi.getReserves, chain, block, calls })
  reserves.forEach(({ _reserve0, _reserve1}, i) => {
    sdk.util.sumSingleBalance(balances,token0s[i],_reserve0, chain)
    sdk.util.sumSingleBalance(balances,token1s[i],_reserve1, chain)
  })
  const tokens = [...token0s, ...token1s]

  return sumTokens2({
    chain, block, owner: orderBook, tokens: getUniqueAddresses(tokens), balances,
  })
}


module.exports = {
  polygon: {
    tvl
  }
}
