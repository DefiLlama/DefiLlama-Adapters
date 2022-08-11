const { stakings } = require('../helper/staking')
const { pool2UniV3 } = require('../helper/pool2')

const config = {
  ethereum: {
    token: '0x3E5D9D8a63CC8a88748f229999CF59487e90721e',
    staking: [
      '0xCbD0F8e80e32B8e82f21f39FDE0A8bcf18535B21', // Pool 360 days
      '0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A', // Pool 30 days
      '0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed', // Pool 90 days
      '0xB9B17B61F7Cf8BDB192547948d5379C8EeaF3cd8', // Pool 180 days
      '0xcbF519299A115e325d6C82b514358362A9CA6ee5', // Iron Pool 180 days
      '0xaF9101314b14D8e243e1D519c0dd4e69DFd44466', // Iron Pool 360 days
      '0x6b392C307E0Fe2a8BE3687Bc780D4157592F4aC2', // nft Pre order
    ],
  },
  bsc: {
    token: '0x582c12b30f85162fa393e5dbe2573f9f601f9d91',
    staking: [
      '0xbEe93fD8822c3a61068Abf54A28734644c9f61Ed', // Pool 210 days
      '0xd38b66aACA9819623380f60814308c6594E2DC26', // Pool 30 days
      '0xd9b5b86De1F696dFe290803b92Fe5e9baCa9371A', // Pool 60 days
      '0x306825856807321671d21d4A2A9a65b02CCB51db', // Smart Pool 3 months + 3 months
    ],
  },
}

module.exports = {
  polygon: {
    pool2: pool2UniV3({ stakingAddress: '0x313c3F878998622f18761d609AA007F2bbC378Db', chain: 'polygon' })
  }
};

Object.keys(config).forEach(chain => {
  const { staking, token, } = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: stakings(staking, token, chain),
  }
})