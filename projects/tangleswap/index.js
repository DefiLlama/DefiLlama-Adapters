const { staking } = require('../helper/staking')
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

async function tvl(api) {
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
module.exports.milkomeda.staking = staking('0xbDD88a555cB49b6b482850aA50c1c2C74fa3367a', '0x6085C822B7A4c688D114468B1380a0Ed1873a0B3')
module.exports.shimmer_evm.staking = staking('0x86eea5C341ece8f96D403eA9fB4d184A6a94C0E1', '0xE5f3dCC241Dd008E3c308e57cf4F7880eA9210F8')
// module.exports.shimmer_evm = uniV3Export({  milkomeda: { factory: "0xdf7bA717FB0D5ce579252f05167cD96d0fA77bCb", fromBlock: 19701714, },}).milkomeda
// module.exports.iotaevm = uniV3Export({  iotaevm: { factory: "0xdf7bA717FB0D5ce579252f05167cD96d0fA77bCb", fromBlock: 19701714, },}).iotaevm