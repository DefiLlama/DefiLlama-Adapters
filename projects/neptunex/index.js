const { getUniTVL } = require('../helper/unknownTokens');

const factory = "0x922FeCbE8dbFDfe85FfF4734046347B8E2ee7c82"

module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, })
  },
}
