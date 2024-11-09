const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/chain/ton')

module.exports = {
  ton: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: "EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2", tokens: [ADDRESSES.null], onlyWhitelistedTokens: true}),
  },
}