const {staking} = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk');


const factory = '0xEF45d134b73241eDa7703fa787148D9C9F4950b0'
const factory2 = '0x9d3591719038752db0c8bEEe2040FfcC3B2c6B9c'
const chain = 'fantom'
const ammTvl = getUniTVL({ chain, factory, useDefaultCoreAssets: false,  })
const ammTvl2 = getUniTVL({ chain, factory: factory2, useDefaultCoreAssets: false, blacklist: ["0x5b2af7fd27e2ea14945c82dd254c79d3ed34685e"] })


module.exports = {
      fantom:{
    tvl: sdk.util.sumChainTvls([ammTvl,ammTvl2]),
    staking: staking("0x2fbff41a9efaeae77538bd63f1ea489494acdc08", "0x5cc61a78f164885776aa610fb0fe1257df78e59b")
  },
}
