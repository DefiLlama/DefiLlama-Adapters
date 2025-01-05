const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  bsc: {
    factoryV1: '0xFe00054AF44E24f0B4bd49b1A2d2984C4264aabE', fromBlockV1: 37882077,
    factoryV2: '0x70e318f5066597868a9026ecccC0e04D693d0fbD', fromBlockV2: 45094649,
  },
}
const USDTBridge = ["0x55d398326f99059fF775485246999027B3197955", "0xAEaF85C740C7a6ee94183E848d0e557cB7FbeA47"];

Object.keys(config).forEach(chain => {
  const { factoryV1, factoryV2, fromBlockV1, fromBlockV2 } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokensAndOwners = [USDTBridge]
      const logsV1 = await getLogs2({ api, factory: factoryV1, eventAbi: 'event PositionOpened (address indexed owner, address indexed position, address ofd, address collateral, uint256 price)', fromBlock: fromBlockV1 })
      const logsV2 = await getLogs2({ api, factory: factoryV2, eventAbi: 'event PositionOpened(address indexed owner, address indexed position, address original, address collateral)', fromBlock: fromBlockV2 })
      logsV1.concat(logsV2).forEach(log => tokensAndOwners.push([log.collateral, log.position]))
      return api.sumTokens({ tokensAndOwners })
    }
  }
})
