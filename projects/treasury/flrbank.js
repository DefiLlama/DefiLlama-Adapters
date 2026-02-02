const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const bank = '0x194726f6c2ae988f1ab5e1c943c17e591a6f6059'

module.exports = {
  flare: {
    tvl: async (api) => {
      await sumTokens2({
        owners: ['0xaA68BC4BAb9a63958466f49f5a58c54A412D4906'],
        tokens: [ADDRESSES.flare.WFLR, '0x0F574Fc895c1abF82AefF334fA9d8bA43F866111'],
        resolveLP: true,
        resolveUniV3: true,
        api,
      })
      api.removeTokenBalance(bank)
    },
    ownTokens: async (api) => {
      await sumTokens2({ owner: '0xaA68BC4BAb9a63958466f49f5a58c54A412D4906', tokens: ['0x0F574Fc895c1abF82AefF334fA9d8bA43F866111'], resolveLP: true, api, })
      api.removeTokenBalance(ADDRESSES.flare.WFLR)
    }
  },
}