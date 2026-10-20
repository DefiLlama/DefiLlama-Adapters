const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = async (api) => {
  const logs = await getLogs2({
    api,
    target: '0xefdbb0ea7647b0e21aef7a3b7a5d6a632c3116c8',
    fromBlock: 17516201,
    eventAbi: 'event ProsperVaultLinked(address indexed r25Vault, bytes32 indexed campaignId, address indexed pToken, address market, address buyback)',
  })
  return [...new Map(logs.map(log => [log.market.toLowerCase(), log])).values()]
}
