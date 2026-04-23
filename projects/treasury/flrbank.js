const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const bank = '0x194726f6c2ae988f1ab5e1c943c17e591a6f6059'
const treasury = '0xaA68BC4BAb9a63958466f49f5a58c54A412D4906'

const SPARKDEX_LP = '0x0F574Fc895c1abF82AefF334fA9d8bA43F866111' // BANK/WFLR SPARKDEX V2 LP
const ENOSYS_LP = '0x5F29C8d049e47DD180c2B83E3560E8e271110335' // BANK/WFLR ENOSYS V2 LP

module.exports = {
  flare: {
    tvl: async (api) => {
      await sumTokens2({
        owner: treasury,
        tokens: [
            ADDRESSES.flare.WFLR,
           SPARKDEX_LP, // SPARKDEX V2 LP (BANK/WFLR)
           ENOSYS_LP, // ENOSYS V2 LP (BANK/WFLR)
           '0xAd552A648C74D49E10027AB8a618A3ad4901c5bE', // FXRP
           '0x4C18Ff3C89632c3Dd62E796c0aFA5c07c4c1B2b3', // stXRP
           '0x12e605bc104e93b45e1ad99f9e555f659051c2bb', // sFLR
           '0x6Cd3a5Ba46FA254D4d2E3C2B37350ae337E94a0F', // CDP
          ],
        resolveLP: true,
        resolveUniV3: true,
        api,
      })
      api.removeTokenBalance(bank)
    },
    ownTokens: async (api) => {
      await sumTokens2({ owner: treasury, tokens: [SPARKDEX_LP, ENOSYS_LP], resolveLP: true, api, })
      api.removeTokenBalance(ADDRESSES.flare.WFLR)
    }
  },
}