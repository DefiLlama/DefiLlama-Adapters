const { getLogs2 } = require('../helper/cache/getLogs')
const { pool2 } = require('../helper/pool2')
const { sumTokensExport } = require('../helper/unknownTokens')

const config = {
  base: { factory: '0x61a98bef11867c69489b91f340fe545eefc695d7', fromBlock: 21180486 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event MarketCreatedWithDescription (address marketAddress, string marketQuestion, string marketSource, string additionalInfo, uint256 endOfTrading, uint256 yesNoTokenCap, address marketOwner)', fromBlock, })
      const markets = logs.map(log => log.marketAddress)
      const tokens = await api.multiCall({ abi: 'address:paymentToken', calls: markets })
      return api.sumTokens({ tokensAndOwners2: [tokens, markets] })
    }
  }
})

module.exports.base.pool2 = pool2('0x688F5B490Edb7F466A89a6Db4fb30829558aF014', '0x1FAE246b1b2D0ce47126bBb109850Da355352D77')
module.exports.base.staking = sumTokensExport({ owner: '0x1a40621C54330940B081F925aA027458a4c035eD', tokens: ['0x21cfcfc3d8f98fc728f48341d10ad8283f6eb7ab'], lps: ['0x1FAE246b1b2D0ce47126bBb109850Da355352D77'], useDefaultCoreAssets: true})