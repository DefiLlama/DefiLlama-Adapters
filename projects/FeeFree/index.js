const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const EVENT_ABI = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'

const config = {
  zora: {
    pool: "0x2BB2DeAeF5D4E62D3798Ce67C3D623da09188AB9",
    fromBlock: 23864003,
  },
  base: {
    pool: "0x60B393a76cEa4a3AFff00e1Fb08d0F63A8F4A314",
    fromBlock: 23809396,
  },
  scroll: {
    pool: "0xA407e0637b22e1F64395D177C8EAD26C03dC3294",
    fromBlock: 11975196,
  }
}

module.exports = {
  start: '2024-12-17',
}

Object.keys(config).forEach(chain => {
  const { pool, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory: pool, eventAbi: EVENT_ABI, fromBlock, })
      const tokens = logs.map(i => [i.currency0, i.currency1]).flat()
      return sumTokens2({ api, owner: pool, tokens, })
    }
  }
})