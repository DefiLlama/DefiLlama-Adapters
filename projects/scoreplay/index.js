const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  start: '2024-07-20',
  base: { tvl: sumTokensExport({ owner: '0x0f646ad0b32e2adacfa702d02e37aae26737d82d', tokens: [ADDRESSES.sophon.USDC] }) },
}