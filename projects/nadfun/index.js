const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const WMON = ADDRESSES.monad.WMON
const LVMON = '0x91b81bfbe3A747230F0529Aa28d8b2Bc898E6D56'

const V1_BONDING_CURVE = '0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE'
const V2_BONDING_CURVE = '0x9f3832732923252A21044F21eE6bd87F09514ae4'

const tokensAndOwners = [
  [WMON, V1_BONDING_CURVE],
  [WMON, V2_BONDING_CURVE],
  [LVMON, V2_BONDING_CURVE],
]

module.exports = {
  methodology: 'Value of WMON and LVMON held in the Nad.fun bonding curve contracts',
  monad: {
    tvl: sumTokensExport({
      tokensAndOwners,
    }),
  },
}
