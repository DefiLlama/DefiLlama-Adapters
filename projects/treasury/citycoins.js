const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

const NYC_DAO_TREASURY = 'SP8A9HZ3PKST0S42VM9523Z9NV42SZ026V4K39WH.ccd002-treasury-nyc-mining-v2'
const MIAMI_REWARDS = 'SP8A9HZ3PKST0S42VM9523Z9NV42SZ026V4K39WH.ccd002-treasury-mia-rewards-v3'

module.exports = {
  stacks: {
    tvl: sumTokensExport({
      owners: [NYC_DAO_TREASURY, MIAMI_REWARDS],
      tokens: [nullAddress]
    }),
  },
};