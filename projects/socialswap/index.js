const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens.js')

const TRON_FACTORY_V1 = 'TN57jo2jGQz3v5YDybyLFHFtvkmRQvCNFz'
const TRON_FACTORY_V2 = 'TSzrq5j2Btn27eVcBAvZj9WQK3FhURamDQ'

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tron: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: TRON_FACTORY_V1, useDefaultCoreAssets: true, }),
      getUniTVL({ factory: TRON_FACTORY_V2, useDefaultCoreAssets: true, }),
    ])
  }
}
