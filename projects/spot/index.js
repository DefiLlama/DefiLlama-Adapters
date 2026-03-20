const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        factory: '0xeca709A67E8e774c827547D900e01B763f77E99f',
        eventAbi: 'event TrancheCreated(address newTrancheAddress)',
        fromBlock: 15800076,
      })
      const bonds = logs.map(log => log.newTrancheAddress)
      return api.sumTokens({ tokens: ["0xd46ba6d942050d489dbd938a2c909a5d5039a161"], owners: [...bonds, "0x82A91a0D599A45d8E9Af781D67f695d7C72869Bd"] })
    }
  }
}