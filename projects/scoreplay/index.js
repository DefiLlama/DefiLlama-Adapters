const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  start: '2024-06-09',
  base: { tvl: sumTokensExport({ owner: '0xFcab8B765FB0BCB05407d16173941e2d1F09DE12', tokens: [ADDRESSES.base.WETH] }) },
  sophon: { tvl: sumTokensExport({ owner: '0x0f646ad0b32e2adacfa702d02e37aae26737d82d', tokens: [ADDRESSES.sophon.USDC] }) },
}