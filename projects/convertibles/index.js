const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { factory: '0x6525fC98F2A43633c2A36d5cCA0aBBdAa6Bd0769', fromBlock: 24343682 },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event ConvertibleCreated (address indexed collateralToken, address indexed priceFeed, uint256 maturity, uint256 conversionPrice, address convertible, uint256 index)', fromBlock, })
      const tokensAndOwners = logs.map(i => [i.collateralToken, i.convertible])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})