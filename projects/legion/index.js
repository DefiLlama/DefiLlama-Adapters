const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0xa0BeB0A8C765482c128a2986c063AF5C3171ff2F', fromBlock: 23182742 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: "event NewPreLiquidSaleV2Created(address saleInstance, (uint256 salePeriodSeconds, uint256 refundPeriodSeconds, uint256 lockupPeriodSeconds, uint256 legionFeeOnCapitalRaisedBps, uint256 legionFeeOnTokensSoldBps, uint256 referrerFeeOnCapitalRaisedBps, uint256 referrerFeeOnTokensSoldBps, uint256 minimumInvestAmount, address bidToken, address askToken, address projectAdmin, address addressRegistry, address referrerFeeReceiver) saleInitParams, (uint256 vestingDurationSeconds, uint256 vestingCliffDurationSeconds, uint256 tokenAllocationOnTGERate) vestingInitParams)", fromBlock, })
      const tokensAndOwners = logs.map(i => [i.saleInitParams.bidToken, i.saleInstance])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})