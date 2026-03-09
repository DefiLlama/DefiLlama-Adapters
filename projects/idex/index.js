const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs")
const { getConfig } = require('../helper/cache')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: { custodian: '0xE5c405C5578d84c5231D3a9a29Ef4374423fA0c2', exchange: '0xa36972e347e538e6c7afb9f44fb10dda7bba9ba2', fromBlock: 11068675 },
  bsc: { custodian: '0xC88c5b8951dD877aFE5558A48450d0eF18121283', exchange: '0x8C788aA08A98002413F6350C29c017aefb2c08C7', fromBlock: 4192829 },
  polygon: {
    custodian: '0x3bcc4eca0a40358558ca8d1bcd2d1dbde63eb468', exchange: '0x3253A7e75539EdaEb1Db608ce6Ef9AA1ac9126B6', fromBlock: 21258769,   },
}

Object.keys(config).forEach(chain => {
  const { exchange, custodian, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, target: exchange, eventAbi: "event TokenRegistered(address indexed assetAddress, string assetSymbol, uint8 decimals)", fromBlock, onlyUseExistingCache: true, })
      const tokens = logs.map(log => log.assetAddress)
      tokens.push(nullAddress)
      if (api.chain === 'polygon') {
        const assets = await getConfig('idex/polygon', 'https://api-matic.idex.io/v1/assets')
        assets.forEach(t => tokens.push(t.contractAddress))
      }
      return sumTokens2({ api, tokens, owner: custodian })
    }
  }
})
