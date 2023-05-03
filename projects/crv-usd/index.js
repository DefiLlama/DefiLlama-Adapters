const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: { factory: '0x818709b85052ddc521fae9c78737b27316337e3a', fromBlock: 17182152 },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xebbe0dfde9dde641808b7a803882653420f3a5b12bb405d238faed959e1e3aa3'],
        eventAbi: 'event AddMarket (address indexed collateral, address controller, address amm, address monetary_policy, uint256 ix)',
        onlyArgs: true,
        fromBlock,
      })

      return sumTokens2({ api, tokensAndOwners: logs.map(i => [i.collateral, i.amm]) })
    }
  }
})
