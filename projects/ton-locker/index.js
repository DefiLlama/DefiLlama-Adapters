const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { transformBalances } = require('../helper/portedTokens')

module.exports = {
  ton: {
    tvl: () => ({}),
    staking: async () => {
      let ton_vault = "EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2"
      const res = await get(`https://tonapi.io/v1/account/getInfo?account=${ton_vault}`)
      return await transformBalances('ton', {[ADDRESSES.null]: res.balance})
    }
  },
}