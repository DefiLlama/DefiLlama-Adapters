const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

const MIAMI_DAO_TREASURY = 'SP8A9HZ3PKST0S42VM9523Z9NV42SZ026V4K39WH.ccd002-treasury-mia-mining-v2'
const NYC_DAO_TREASURY = 'SP8A9HZ3PKST0S42VM9523Z9NV42SZ026V4K39WH.ccd002-treasury-nyc-mining-v2'

module.exports = {
  stacks: {
    tvl: sumTokensExport({
      owners: [MIAMI_DAO_TREASURY, NYC_DAO_TREASURY],
      tokens: [nullAddress]
    }),
  },
};