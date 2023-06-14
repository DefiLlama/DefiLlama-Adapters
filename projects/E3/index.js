const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  fantom:   '0x8597dB3ba8dE6BAAdEDa8cBa4dAC653E24a0e57B',
  arbitrum: '0x8597dB3ba8dE6BAAdEDa8cBa4dAC653E24a0e57B'
  ///zkevm: tbd
}
async function tvl(_, _b, _cb, { api, }) {
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
  methodology: 'Only the tokens inside E3 Liquidity Pools are counted in our TVL.',
}

Object.keys(factories).forEach(chain => {
  module.exports[chain] = { tvl }
})
