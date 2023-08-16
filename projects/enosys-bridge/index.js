const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdc: { tvl: sumTokensExport({ owner: '0xd5308a4bb2d7121a26d0bd11257245f0efda2bc4', tokens: [ADDRESSES.xdc.WXDC] }) },
  ethereum: { tvl: sumTokensExport({ owner: '0x8936761f2903ed1af2b269e6fa3a79ebb0162c51', tokens: [ADDRESSES.ethereum.USDT] }) },
}