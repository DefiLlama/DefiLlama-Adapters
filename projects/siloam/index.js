const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x6e1Bb585ca754db1202Cf555f1dE6A12fe5aCeec'
const DEPLOY_BLOCK = 47599755

module.exports = {
  methodology:
    'TVL is the sum of each Siloam pool\'s balance in its deposit token. ' +
    'Pools are enumerated from the factory\'s PoolCreated events; each pool ' +
    'is a sovereign contract denominated in exactly one ERC-20.',
  base: {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: FACTORY,
        eventAbi:
          'event PoolCreated(address indexed pool, address indexed creator, address indexed depositToken, address yieldAdapter, bytes32 salt, bool isWhitelisted)',
        onlyArgs: true,
        fromBlock: DEPLOY_BLOCK,
      })
      const ownerTokens = logs.map((l) => [[l.depositToken], l.pool])
      return sumTokens2({ api, ownerTokens })
    },
  },
}
