const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/utils')
const ADDRESSES = require("../helper/coreAssets.json")

const config = {
  arbitrum: { factory: '0x6f889e3fce9b13fe8cefa068a48f4074292e663c', fromBlock: 70478558 },
}

const config2 = {
  blast: { factory: '0xB40DBBb7931Cfef8Be73AEEC6c67d3809bD4600B', fromBlock: 309120 },
}

const config3 = {
  base: { factory: '0x7AeD738B791917E0f6578F62A529d8e22427877B', tokens: [ADDRESSES.base.WETH] },
}

Object.keys(config).forEach(chain => {
  const { fromBlock, factory, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
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



Object.keys(config2).forEach(chain => {
  const { fromBlock, factory, } = config2[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event MarketCreated(bytes32 indexed, address, address, uint256)',
        onlyArgs: true,
        fromBlock: fromBlock,
      })
      const tokens = logs.map(i => i[2])
      return api.sumTokens({ owner: factory, tokens })
    }
  }
})

Object.keys(config3).forEach(chain => {
  const { factory, tokens } = config3[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      return api.sumTokens({ owner: factory, tokens })
    }
  }
})

