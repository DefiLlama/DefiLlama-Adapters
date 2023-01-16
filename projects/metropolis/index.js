
const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  fantom: '0xb842766eade13b3c51cbaed70aa128760859c0bf',
}
async function tvl(_, _b, _cb, { api, }) {
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
  return sumTokens2({...api, tokensAndOwners: toa, })
}

module.exports = {
  methodology: 'We count the token balances in in different liquidity book contracts',
  fantom:{
    tvl,
  },
};
