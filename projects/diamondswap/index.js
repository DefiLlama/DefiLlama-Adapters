const { uniTvlExports } = require('../helper/unknownTokens')
const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = uniTvlExports({
  odyssey: '0x7d57C45dC107497C5c5c0F544a84691D2b06BC83',
  base: '0xdc93aca9bf72ceb35d1f2cd305bd8335b5b88757',
  avax: '0x7ab5ac142799b0a3b6f95c27a1f2149ebcf5287d',
})


async function tvl(api) {
  const { factories } = config[api.chain]
  const ownerTokens = []

  for (const { factory, fromBlock } of factories) {
    const logs = await getLogs({
      api,
      target: factory,
      topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
      fromBlock,
    })
    const pools = logs.map(i => getAddress(i.data.slice(0, 64 + 2)))
    const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
    const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
    pools.map((pool, i) => ownerTokens.push([[token0s[i], token1s[i]], pool]))
  }
  return sumTokens2({ api, ownerTokens })
}

const config = {
  ethereum: { factories: [{ factory: '0xE1046fcB1057ef82B68f3A6B8eBb0e411Cf334E0', fromBlock: 18024947, },], },
  bsc: {
    factories: [{
      factory: '0x81a1417cbec636e631fa62b81f970a5ec23b39ca', fromBlock:
        32062831,
    },],
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})