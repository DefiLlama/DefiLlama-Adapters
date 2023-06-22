const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdc: { tvl: sumTokensExport({ owner: '0xd5308a4bb2d7121a26d0bd11257245f0efda2bc4', tokens: [ADDRESSES.xdc.WXDC] }) },
  ethereum: { tvl: sumTokensExport({ owner: '0xb3902647015c17fc3c2f5ca5f5cb68bbf2d9b1e2', tokens: [ADDRESSES.ethereum.USDT] }) },
}