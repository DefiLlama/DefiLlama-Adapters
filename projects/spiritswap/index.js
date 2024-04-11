const {staking} = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require("../helper/uniswapV3");
const sdk = require('@defillama/sdk');


const factory = '0xEF45d134b73241eDa7703fa787148D9C9F4950b0'
const factory2 = '0x9d3591719038752db0c8bEEe2040FfcC3B2c6B9c'
const factory3 = '0xb860200BD68dc39cEAfd6ebb82883f189f4CdA76'

const chain = 'fantom'
const ammTvl = getUniTVL({ chain, factory, useDefaultCoreAssets: false,  })
const ammTvl2 = getUniTVL({ chain, factory: factory2, useDefaultCoreAssets: false, blacklist: ["0x5b2af7fd27e2ea14945c82dd254c79d3ed34685e"] })
const ammTvl3 = uniV3Export({ chain, factory: factory3, fromBlock: 78654346 , isAlgebra: true })

module.exports = {
      fantom:{
    tvl: sdk.util.sumChainTvls([ammTvl,ammTvl2, ammTvl3]),
    staking: staking("0x2fbff41a9efaeae77538bd63f1ea489494acdc08", "0x5cc61a78f164885776aa610fb0fe1257df78e59b", 'fantom')
  },
}
