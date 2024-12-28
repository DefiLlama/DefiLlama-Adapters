const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: uniTvlExport("0x535646cf57E4155Df723bb24625f356d98ae9D2F", "fantom", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, }),
  }
}// node test.js projects/spartacus-exchange/index.js