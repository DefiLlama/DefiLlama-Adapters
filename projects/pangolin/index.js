const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The Pangolin subgraph and the Pangolin factory contract address are used to obtain the balance held in every LP pair.',
  avax:{
    tvl: getUniTVL({ chain: 'avax', useDefaultCoreAssets: true, factory: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88', }),
  },
  start: 1612715300, // 7th-Feb-2021
}