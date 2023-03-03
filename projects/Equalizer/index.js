const { staking } = require('../helper/staking')
const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  fantom: {
    tvl: getUniTVL({
      factory: '0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a',
      fetchBalances: true,
      useDefaultCoreAssets: true,
    }),
    staking: staking("0x8313f3551C4D3984FfbaDFb42f780D0c8763Ce94", "0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6","fantom"),
  }
}