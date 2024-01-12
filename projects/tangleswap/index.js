const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens2, } = require('../helper/unwrapLPs')
const { uniV3Export, } = require('../helper/uniswapV3')

const config = {
  shimmer_evm: { endpoint: 'https://shimmer.subgraph.tangleswap.space/subgraphs/name/tangleswap/shimmer-v3' },
}
const query = `query getPools($lastId: String!) {
  pools(
    first: 1000
    where: {id_gt: $lastId}
  ) {
    id
    token0 {      id    }
    token1 {      id    }
  }
}`

async function tvl(ts, block, _, { api }) {
  const { endpoint } = config[api.chain]
  const pools = await cachedGraphQuery('tangleswap/' + api.chain, endpoint, query, { fetchById: true, })
  return sumTokens2({
    api,
    ownerTokens: pools.map(i => {
      return [[i.token0.id, i.token1.id], i.id]
    })
  })
}


Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.milkomeda = uniV3Export({  milkomeda: { factory: "0xda2f048C128506e720b0b0b32F20432157dde1c7", fromBlock: 19701714, },}).milkomeda
// module.exports.shimmer_evm = uniV3Export({  milkomeda: { factory: "0xdf7bA717FB0D5ce579252f05167cD96d0fA77bCb", fromBlock: 19701714, },}).milkomeda