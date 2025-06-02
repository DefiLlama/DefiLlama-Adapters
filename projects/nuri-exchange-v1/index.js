const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  scroll:{
    tvl: getUniTVL({ factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
    staking: staking("0xAAAEa1fB9f3DE3F70E89f37B69Ab11B47eb9Ce6F", "0xAAAE8378809bb8815c08D3C59Eb0c7D1529aD769"),
  },
}