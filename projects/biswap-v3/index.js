const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

const config = {
  bsc: { factory: '0x4d175f2cfe3e2215c1b55865b07787b751cedd36', fromBlock: 31041441 },
  ethereum: {factory: '0x41a9873b1F172696739B74Dd0B9CCf976fD4c735', fromBlock: 20769047},
  arbitrum: {factory: '0x41a9873b1F172696739B74Dd0B9CCf976fD4c735', fromBlock: 225593298},
  base: {factory: '0x41a9873b1F172696739B74Dd0B9CCf976fD4c735', fromBlock: 16268966},
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xe857b53ada03b8d88fd7546e77c34d3b68996e6ce330f0edee6e813b7daea099'],
        eventAbi: 'event NewPool (address indexed tokenX, address indexed tokenY, uint16 indexed fee, uint24 pointDelta, address pool)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(log => [[log.tokenX, log.tokenY], log.pool])
      return sumTokens2({ api, ownerTokens })
    }
  }
})