const { getUniTVL } = require('./helper/unknownTokens')
const { staking } = require('./helper/staking')

module.exports = {
  bsc: {
    tvl: getUniTVL({
      factory: '0xd76d8c2a7ca0a1609aea0b9b5017b3f7782891bf',
      useDefaultCoreAssets: true,
    }),
    staking: staking('0x44eB0f1ce777394564070f9E50dD8784FCDB7e6a', '0x9029fdfae9a03135846381c7ce16595c3554e10a')
  },
  ethereum: {
    tvl: getUniTVL({
      factory: '0x1f8c25f8da3990ecd3632ee4f02c2ea37755c3c6',
      useDefaultCoreAssets: true,
    }),
    staking: staking('0xb99d38eb69214e493b1183ffa3d561fc9f75d519', '0x7778360f035c589fce2f4ea5786cbd8b36e5396b',)
  },
  avax: {
    tvl: getUniTVL({
      factory: '0x042AF448582d0a3cE3CFa5b65c2675e88610B18d',
      useDefaultCoreAssets: true,
    }),
    staking: staking('0x4C431b568e8baAB20F004BB16E44570e8E0cD6D7', '0x0ebd9537a25f56713e34c45b38f421a1e7191469')
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0xd76d8C2A7CA0a1609Aea0b9b5017B3F7782891bf',
      useDefaultCoreAssets: true,
    }),
  },
  kava: {
    tvl: getUniTVL({
      factory: '0x6dd434082EAB5Cd134B33719ec1FF05fE985B97b',
      useDefaultCoreAssets: true,
    })
  }
}
