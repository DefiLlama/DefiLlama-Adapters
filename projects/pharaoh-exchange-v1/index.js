const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
    staking: staking("0xAAA3249511DE3E7A5c61FbA8313170c1Bef9A65e", "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b"),
  },
}