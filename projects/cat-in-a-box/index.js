const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: [
      '0x7f0A0C7149a46Bf943cCd412da687144b49C6014',
      '0x24146D1B3339Cf76b455dC42e71Ea5Cdff4aE0d7',
    ], tokens: [ADDRESSES.ethereum.STETH]})
  }
}