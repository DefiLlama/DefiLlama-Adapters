const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')

function uniV3Export(config) {
  const exports = {}

  Object.keys(config).forEach(chain => {
    const { factory, fromBlock } = config[chain]
    exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const logs = await getLogs({
          api,
          target: factory,
          topics: ['0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db'],
          fromBlock,
          eventAbi: 'event Pool (address indexed token0, address indexed token1, address pool)',
          onlyArgs: true,
        })

        return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]), })
      }
    }
  })


  return exports
}

module.exports = {
  uniV3Export,
};
