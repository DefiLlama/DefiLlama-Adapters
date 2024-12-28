const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  avax: '0x6e77932a92582f504ff6c4bdbcef7da6c198aeef',
  arbitrum: '0x1886d09c9ade0c5db822d85d21678db67b6c2982',
  bsc: '0x43646a8e839b2f2766392c1bf8f60f6e587b6960',
}
async function tvl(api) {
  const pools = await api.fetchList({
    target: factories[api.chain],
    itemAbi: 'function allLBPairs(uint256) view returns (address)',
    lengthAbi: 'uint256:getNumberOfLBPairs',
  })
  const tokenA = await api.multiCall({
    abi: 'address:tokenX',
    calls: pools,
  })
  const tokenB = await api.multiCall({
    abi: 'address:tokenY',
    calls: pools,
  })
  const toa = []
  tokenA.map((_, i) => {
    toa.push([tokenA[i], pools[i]])
    toa.push([tokenB[i], pools[i]])
  })
  return sumTokens2({ api, tokensAndOwners: toa, })
}

module.exports = {
  methodology: 'We count the token balances in in different liquidity book contracts',
}

Object.keys(factories).forEach(chain => {
  module.exports[chain] = { tvl }
})