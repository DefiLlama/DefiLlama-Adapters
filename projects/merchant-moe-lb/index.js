const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  mantle: '0xa6630671775c4EA2743840F9A5016dCf2A104054',
}
async function tvl(api) {
  const pools = await api.fetchList({
    target: factories[api.chain],
    itemAbi: 'function getLBPairAtIndex(uint256) view returns (address)',
    lengthAbi: 'uint256:getNumberOfLBPairs',
  })
  const tokenA = await api.multiCall({
    abi: 'address:getTokenX',
    calls: pools,
  })
  const tokenB = await api.multiCall({
    abi: 'address:getTokenY',
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