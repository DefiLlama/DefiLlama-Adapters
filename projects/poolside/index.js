const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: { factory: '0xb8de4ab6c65e274630f5279f74eb69b66327ce50', fromBlock: 17877905 },
  base: { factory: '0x75a92DfB38C3506dcE3Bbb5EB32A10852f9ba64a', fromBlock: 3674737 },
  avax: { factory: '0x19470c5e0199B7157822Ca627860B08750eCe375', fromBlock: 35711675 },
  arbitrum: { factory: '0xdb55fdd06134424372ef3458da3ccc20e3a6ca16', fromBlock: 185295644},
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event PairCreated (address indexed token0, address indexed token1, address pair, uint256 count)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(i => [[i.token0, i.token1], i.pair])
      return sumTokens2({ api, ownerTokens, })
    }
  }
})
