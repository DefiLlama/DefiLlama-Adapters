const { cachedGraphQuery } = require('../helper/cache')

const query = `{
  uniPools (first: 1000 where: {
    uniPoolType:v3
  } orderBy: volumeUSD orderDirection:desc) {
    id
  }
  
}`
module.exports = {
  somnia: { tvl }
}

async function tvl(api) {
  const { uniPools } = await cachedGraphQuery('somnex-v3/somnia', 'https://api.subgraph.somnia.network/api/public/962dcbf6-75ff-4e54-b778-6b5816c05e7d/subgraphs/somnia-swap/v1.0.0/gn', query)
  const pools = uniPools.map(i => i.id)
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const ownerTokens = pools.map(((pool, i) => [[token0s[i], token1s[i]], pool]))
  return api.sumTokens({ ownerTokens, })
}