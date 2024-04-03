const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/utils')
const config = {
  arbitrum: { factory: '0x6f889e3fce9b13fe8cefa068a48f4074292e663c', fromBlock: 70478558 },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { fromBlock, factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xe56f19ada061bf6161817694d647d94134afe9d3e877db1d8118b3012b744635'],
        eventAbi: 'event MarketCreation(address, address, address, uint256, uint256, uint256, uint256, uint256 expiryTime)',
        onlyArgs: true,
        fromBlock: fromBlock,
      })
      const markets = logs.map(i => i[0])
      let tokens = await api.multiCall({ abi: 'address:getCollateral', calls: markets })
      let wrappedTokens = getUniqueAddresses(tokens)
      const tokenNames = await api.multiCall({ abi: 'string:name', calls: wrappedTokens })
      wrappedTokens = wrappedTokens.filter((v, i) => tokenNames[i].startsWith('prePO'))
      let baseTokens = await api.multiCall({ abi: 'address:getBaseToken', calls: wrappedTokens })
      const tokensAndOwners = baseTokens.map((v, i) => [v, wrappedTokens[i]])
      markets.forEach((v, i) => tokensAndOwners.push([tokens[i], v]))
      return sumTokens2({ api, tokensAndOwners, blacklistedTokens: wrappedTokens })
    }
  }
})

