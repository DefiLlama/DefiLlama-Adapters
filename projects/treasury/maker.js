const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

module.exports = treasuryExports({
  ethereum: {
    owners: ['0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB'],
    ownTokens: ['0xc20059e0317de91738d13af027dfc4a50781b066', '0x56072c95faa701256059aa122697b133aded9279', ADDRESSES.ethereum.MKR]
  },
  arbitrum: {
    owners: ['0x10e6593cdda8c58a1d0f14c5164b376352a55f2f'],
    tokens: [nullAddress]
  }
})