const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")
const dlcBTC_arbitrum = '0x050C24dBf1eEc17babE5fc585F06116A259CC77A'
const cbBTC_base = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf'

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      owners: [
        '0x5954B84F4ba745E1A85E9A5875ce3bDf863200ba', // ETH CALL
        '0x3cF1A20AE73ff128D3A40F4492fdE59F2B2D1e8C', // WBTC CALL
        '0x1eb466780e412C796A7BEdA541CfF47E0571A000', // ARB CALL
        '0x69ff3c3344C4F945205ddeA9A66c99c0A07D8aae', // WSOL CALL
        '0x7A5A597d5c1D09F919e91Db5A986A4Dd2DEc0Af4', // dlcBTC CALL
        '0xE26f15B3cc23e8a5adE4c10CCc69e50520eE2a89', // ETH WBTC dlcBTC PUT
        '0x1DDD814589376Db497F91eFD2E6AFF969822a951'  // ETH WBTC dlcBTC PUT
      ],
      tokens: [ADDRESSES.arbitrum.WBTC, ADDRESSES.null, ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.ARB, dlcBTC_arbitrum]
    })
  },
  base: {
    tvl: sumTokensExport({
      owners: [
        '0x37a4f273B341C077230aA2d967590b8a74D37598', // ETH CALL
        '0x4FAF5c3809E8Dc966Ff7AeDDFb501AF6f85Fbeb7', // cbBTC CALL
        '0x8aB7037c4073200c907da014C626222624E1Fc47', // ETH cbBTC PUT
      ],
      tokens: [ADDRESSES.null, cbBTC_base]
    })
  },
}
