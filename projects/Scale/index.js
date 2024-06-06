const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  base:{
    tvl: uniTvlExport("0xEd8db60aCc29e14bC867a497D94ca6e3CeB5eC04", "base", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: true, fetchBalances: true, }),
    staking: staking("0x28c9c71c776a1203000b56c0cca48bef1cd51c53", "0x54016a4848a38f257b6e96331f7404073fd9c32c"),
  },
}
