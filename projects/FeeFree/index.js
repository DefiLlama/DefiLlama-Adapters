const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const EVENT_ABI = 'event Initialize(bytes32 id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks)'

const config = {
  zora: {
    pool: "0xB43287b2106BC044F07aE674794f5492E851d3dC",
    router: "0x0Fee97363deEFBE4De038D437D805A98dbEbA400",
    fromBlock: 13704184,
  },
  base: {
    pool: "0xc08304a5300D9a2310A603b8D7fB8470f752947F",
    router: "0x0Fee76f15DE74A5211e5Bc2aBF95394d7f50C400",
    fromBlock: 14089843,
  }
}

module.exports = {
  start: '2024-04-25', // Apr 26 2024
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