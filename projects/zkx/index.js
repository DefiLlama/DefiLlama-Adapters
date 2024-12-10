const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ['0x8F5Af913D42DbC296d0e184B6356EC4256029D09'], tokens: [ADDRESSES.ethereum.USDC], })
  }
}
