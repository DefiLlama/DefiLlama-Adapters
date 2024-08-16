
const { getLogs } = require('../helper/cache/getLogs');
const { getUniqueAddresses } = require('../helper/tokenMapping');

const config = {
  ethereum: { bank: '0x1150d370C61cdd5d6F81c68783678382b447B07D', fromBlock: 18569809, },
  bsc: { bank: '0x5F579336b1959a4a51782B61ce8E877fF6171A6C', fromBlock: 34515370, },
  arbitrum: { bank: '0xAcF4dC6043043324b84aFE77e00678607F9e70fF', fromBlock: 223761172, },
}

const abis = {
  trancheCount: "uint8:trancheCount",
  tranches: "function tranches(uint256) view returns (uint256 totalDepositAmount, uint256 totalBorrowAmount, uint256 totalDepositShare, uint256 totalBorrowShare)",
}

const eventAbi = "event SetMarketConfiguration(address indexed market, tuple(uint32 collateralFactor, uint32 borrowFactor, uint32 expirationTimestamp, uint8 riskTranche, bool isIsolatedCollateral) marketConfig)"
function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  cache.logs.push(...logs.map(i => i.market))
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}

Object.keys(config).forEach(chain => {
  const { bank, fromBlock, } = config[chain]
  const _getLogs = api => getLogs({ api, target: bank, eventAbi, onlyArgs: true, fromBlock, customCacheFunction, topics: ['0xd2d779713065b66e1a8468059dd72d70a8e8722e4fbd838c618e9b6f25f20b77'] })
  module.exports[chain] = {
    tvl: async (api) => {
      const markets = await _getLogs(api)
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: markets })
      return api.sumTokens({ tokensAndOwners2: [tokens, markets] })
    },
    borrowed: async (api) => {
      const markets = await _getLogs(api)
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: markets })
      const trancheCounts = await api.multiCall({ abi: abis.trancheCount, calls: markets, permitFailure: true })
      const borrowTokens = []
      const calls = []
      for (let i = 0; i < trancheCounts.length; i++) {
        const trancheCount = trancheCounts[i]
        if (!trancheCount) continue
        for (let j = 0; j < trancheCount; j++) {
          borrowTokens.push(tokens[i])
          calls.push({ target: markets[i], params: j })
        }
      }
      const borrowBals = (await api.multiCall({ abi: abis.tranches, calls })).map(i => i.totalBorrowAmount)
      api.addTokens(borrowTokens, borrowBals)
      return api.getBalances()
    },
  }
})