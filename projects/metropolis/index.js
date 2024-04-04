const { sumTokens2 } = require('../helper/unwrapLPs')

const factories = {
  fantom: '0xdD693b9F810D0AEE1b3B74C50D3c363cE45CEC0C',
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
  return sumTokens2({api, tokensAndOwners: toa, })
}

module.exports = {
  hallmarks: [
    [1680097334,"Acquired by Swapline"]
  ],
  methodology: 'We count the token balances in in different liquidity book contracts',
  fantom:{
    tvl: () => 0
  },
  deadFrom: 1680097334,
};