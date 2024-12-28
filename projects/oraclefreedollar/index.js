const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  bsc: { factory: '0xFe00054AF44E24f0B4bd49b1A2d2984C4264aabE', fromBlock: 37882077, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event PositionOpened (address indexed owner, address indexed position, address ofd, address collateral, uint256 price)', fromBlock, })
      const tokensAndOwners = logs.map(log => [log.collateral, log.position])
      return api.sumTokens({ tokensAndOwners })
    }
  }
})