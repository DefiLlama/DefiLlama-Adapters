const {uniTvlExport} = require('../helper/calculateUniTvl.js')
module.exports = {
  misrepresentedTokens: true,
  base:{
    tvl: uniTvlExport("0xEd8db60aCc29e14bC867a497D94ca6e3CeB5eC04", "base", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true,  }),
  },
}