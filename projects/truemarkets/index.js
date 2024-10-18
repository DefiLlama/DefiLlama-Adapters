const { getLogs2 } = require('../helper/cache/getLogs')
const { base } = require('../radiant-v2')

const config = {
  base: { factory: '0x288025b60330e01d793B6e83c1a0dE22bb943459', fromBlock: 21180486 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event MarketCreatedWithDescription (address marketAddress, string marketQuestion, string marketSource, string additionalInfo, uint256 endOfTrading, uint256 yesNoTokenCap, address marketOwner)', fromBlock, })
      const markets = logs.map(log => log.marketAddress)
      const tokens = await api.multiCall({  abi: 'address:paymentToken', calls: markets})
      return api.sumTokens({ tokensAndOwners2: [tokens, markets]})
    }
  }
})