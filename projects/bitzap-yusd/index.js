const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  btr: {
    pools: [
      { factory: '0x076f890bb7169bbbc282458cbdd5414d5af0af25', fromBlock: 10053638 },
    ]
  },
}

module.exports = {
};


Object.keys(config).forEach(chain => {
  const { pools} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await Promise.all(pools.map(getLogs_))

      return sumTokens2({ api, tokensAndOwners: logs.flat().map(i => [i.collateral, i.amm]) })

      async function getLogs_({ factory, fromBlock }) {
        return getLogs({
          api,
          target: factory,
          topics: ['0xebbe0dfde9dde641808b7a803882653420f3a5b12bb405d238faed959e1e3aa3'],
          eventAbi: 'event AddMarket (address indexed collateral, address controller, address amm, address monetary_policy, uint256 ix)',
          onlyArgs: true,
          fromBlock,
        })
      }
    }
  }
})

// returning 0
