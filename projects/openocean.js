const { getUniTVL } = require('./helper/unknownTokens')
const { staking } = require('./helper/staking')

const config = {
  bsc: { factory: '0xd76d8c2a7ca0a1609aea0b9b5017b3f7782891bf', s: ['0x44eB0f1ce777394564070f9E50dD8784FCDB7e6a', '0x9029fdfae9a03135846381c7ce16595c3554e10a'], },
  polygon: { factory: '0xd76d8C2A7CA0a1609Aea0b9b5017B3F7782891bf', },
  kava: { factory: '0x6dd434082EAB5Cd134B33719ec1FF05fE985B97b', },
  arbitrum: { factory: '0x01Ec93c289cB003e741f621cDD4FE837243f8905', },
  manta: { factory: '0x8D2B7e5501Eb6D92F8e349f2FEbe785DD070bE74', },
  avax: { factory: '0x042AF448582d0a3cE3CFa5b65c2675e88610B18d', s: ['0x4C431b568e8baAB20F004BB16E44570e8E0cD6D7', '0x0ebd9537a25f56713e34c45b38f421a1e7191469'], },
  ethereum: { factory: '0x1f8c25f8da3990ecd3632ee4f02c2ea37755c3c6', s: ['0xb99d38eb69214e493b1183ffa3d561fc9f75d519', '0x7778360f035c589fce2f4ea5786cbd8b36e5396b'], },
  rsk: { factory: '0x6Dd434082EaB5cD134B33719ec1ff05fe985B97b', },
}

module.exports = { misrepresentedTokens: true }

Object.keys(config).forEach(chain => {
  const { factory, s } = config[chain]
  module.exports[chain] = { tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }), }
  if (s)
    module.exports[chain].staking = staking(...s)
})
