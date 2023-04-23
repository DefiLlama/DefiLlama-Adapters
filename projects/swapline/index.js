const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  fantom: '0x640801a6983c109805E928dc7d9794080C21C88E',
  optimism: '0xd08C98F6409fCAe3E61f3157B4147B6595E60cf3',
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
  return sumTokens2({...api, tokensAndOwners: toa, })
}

module.exports = {
  methodology: 'We count the token balances in in different liquidity book contracts',
  fantom:{
    tvl,
  },
  optimism:{
    tvl,
  },
};