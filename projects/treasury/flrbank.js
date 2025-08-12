const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  flare: {
    tvl: sumTokensExport({
      owners: ['0xaA68BC4BAb9a63958466f49f5a58c54A412D4906'],
      tokens: [ADDRESSES.flare.WFLR, '0x0F574Fc895c1abF82AefF334fA9d8bA43F866111' ],
      resolveLP: true,
      blacklistedTokens: ['0x194726f6c2ae988f1ab5e1c943c17e591a6f6059'],
      resolveUniV3: true,
    })
  },
}