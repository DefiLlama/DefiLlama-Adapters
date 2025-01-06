const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  bsc: {
    factory: '0x70e318f5066597868a9026ecccC0e04D693d0fbD', fromBlock: 45094649,
  },
}
const USDTBridge = ["0x55d398326f99059fF775485246999027B3197955", "0xAEaF85C740C7a6ee94183E848d0e557cB7FbeA47"];

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokensAndOwners = [USDTBridge]
      const logs = await getLogs2({ api, factory, eventAbi: 'event PositionOpened(address indexed owner, address indexed position, address original, address collateral)', fromBlock })
      logs.forEach(log => tokensAndOwners.push([log.collateral, log.position]))
      return api.sumTokens({ tokensAndOwners })
    }
  }
})
