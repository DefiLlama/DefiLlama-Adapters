const { cachedGraphQuery } = require('../helper/cache')
const abi = require('./abi.json')

const GRAPH_URLS = {
  ethereum: [
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_1_0',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_2',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_3_8',
    'https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3'
  ],
  celo: ['https://api.thegraph.com/subgraphs/name/pooltogether/celo-v3_4_5'],
  bsc: ['https://api.thegraph.com/subgraphs/name/pooltogether/bsc-v3_4_3']
}
const GRAPH_QUERY = `
  query GET_POOLS {
    prizePools { id }
  }
`
async function tvl(api) {
  const graphUrls = GRAPH_URLS[api.chain] ?? []
  const pools = []
  if (api.chain === 'polygon') pools.push('0x887E17D791Dcb44BfdDa3023D26F7a04Ca9C7EF4', '0xee06abe9e2af61cabcb13170e01266af2defa946')
  for (const endpoint of graphUrls) {
    const key = `pooltogether/${api.chain}/${endpoint.split('pooltogether/')[1]}`
    const { prizePools } = await cachedGraphQuery(key, endpoint, GRAPH_QUERY,)
    pools.push(...prizePools.map(i => i.id))
  }
  const tokens = await api.multiCall({  abi: 'address:token', calls: pools})  
  const bals = await api.multiCall({  abi: abi.accountedBalance, calls: pools})
  api.addTokens(tokens, bals)
  return api.getBalances()
}

module.exports = {
  tvl,
}
