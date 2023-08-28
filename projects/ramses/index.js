const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  arbitrum:{
    tvl: getUniTVL({ factory: '0xAAA20D08e59F6561f242b08513D36266C5A29415', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
    staking: staking("0xAAA343032aA79eE9a6897Dab03bef967c3289a06", "0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418"),
  },
}