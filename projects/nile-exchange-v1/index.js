const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  linea:{
    tvl: getUniTVL({ factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
    staking: staking("0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F", "0xAAAac83751090C6ea42379626435f805DDF54DC8"),
  },
}