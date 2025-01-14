const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: {
    factory: '0xf047ab4c75cebf0eb9ed34ae2c186f3611aeafa6', fromBlock: 19237243, missing: [
      '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
      '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    ]
  },
  zircuit: { factory: '0x7d8311839eB44Dd5194abd2dd3998722455A24E0', fromBlock: 2427557, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, missing = [] } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: 'event TokenStakabilityChanged(address token, bool enabled)', fromBlock, })
      const tokens = logs.map(i => i.token).concat(missing)
      return sumTokens2({ api, owner: factory, tokens, permitFailure: true, })
    }
  }
})