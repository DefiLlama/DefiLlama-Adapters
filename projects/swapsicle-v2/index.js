const { uniV3Export } = require("../helper/uniswapV3");
const { cachedGraphQuery } = require('../helper/cache')

module.exports = uniV3Export({
  mantle: {
    factory: "0xC848bc597903B4200b9427a3d7F61e3FF0553913",
    fromBlock: 9796947,
    isAlgebra: true,
  },
  telos: {
    factory: "0xA09BAbf9A48003ae9b9333966a8Bda94d820D0d9",
    fromBlock: 301362984,
    isAlgebra: true,
  },
});

const config = {
  mantle: { endpoint: 'https://subgraph-api.mantle.xyz/subgraphs/name/cryptoalgebra/analytics' },
  telos: { endpoint: 'https://api.goldsky.com/api/public/project_clr6mlufzbtuy01vd012wgt5k/subgraphs/swapsicle/analytics/gn' },
}

const query = `{
  pools {
    id
    token0 { id }
    token1 { id }
  }
}`

Object.keys(config).forEach(chain => {
  const { endpoint } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const { pools } = await cachedGraphQuery('swapsicle-v2/' + chain, endpoint, query, { api, })
      const ownerTokens = pools.map(i => [[i.token0.id, i.token1.id], i.id])
      return api.sumTokens({ ownerTokens })
    }
  }
})