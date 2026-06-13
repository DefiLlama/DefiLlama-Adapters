const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports } = require('../helper/treasury')

const treasuryAddresses = [
  "0xDA1f681eEC73bC4a7CB6C90696F0744D46C282d6",
  "0x5Fd54D6835D32AdFAd96339051Fc8CD2E441a65D",
  "0xdF582Ae88f1Abd0AdF6D48988A87ceD1594f4791",
]

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.null],
    owners: treasuryAddresses,
  },
})