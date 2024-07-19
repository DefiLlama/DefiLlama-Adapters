const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const factory = "0x7bbAB21475d99C09a92fc4B93Fa2DDa987DbA17c"

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1666656000, "Rug Pull"]
  ],
  dogechain: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory, useDefaultCoreAssets: true, }),
      getUniTVL({ factory: '0x8E49Fa5fA4494c3a4358DC00F1c1e4dfA0A3b7eF', useDefaultCoreAssets: true, }),
    ]),
  }
}
