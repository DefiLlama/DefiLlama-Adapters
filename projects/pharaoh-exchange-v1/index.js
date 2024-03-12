const {getUniTVL} = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  avax:{
<<<<<<< HEAD
    tvl: getUniTVL({ factory: '0xAAA16c016BF556fcD620328f0759252E29b1AB57', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
=======
    tvl: getUniTVL({ factory: '0xAAA91e283126774b3bb513fD5922976d5212dc49', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'crAMM' }),
>>>>>>> 26da82eec2e4e4e68c0756d6278ca71758c22e9c
    staking: staking("0xAAA3249511DE3E7A5c61FbA8313170c1Bef9A65e", "0xAAAB9D12A30504559b0C5a9A5977fEE4A6081c6b"),
  },
}