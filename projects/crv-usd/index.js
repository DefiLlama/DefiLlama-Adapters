const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: {
    pools: [
      { factory: '0x818709b85052ddc521fae9c78737b27316337e3a', fromBlock: 17182152 },
      { factory: '0x30a2F3c3AA6D12C0a36Bed210dCF1B32EF6228Cc', fromBlock: 17187330 },
      { factory: '0xfa3e2db8eb6c646e0d24046c1a185934d41a8f7a', fromBlock: 17187330 },
      { factory: '0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC', fromBlock: 17187330 },
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

module.exports.hallmarks = [
  [1742470655, "Resupply Launch"]
]