const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: 'The SMBswap subgraph and the SMBswap factory contract address are used to obtain the balance held in every LP pair.',
  bsc: {
    tvl: getUniTVL({ factory: '0x2Af5c23798FEc8E433E11cce4A8822d95cD90565', chain: 'bsc', useDefaultCoreAssets: true }),
  },
  start: 1645285089, // Sat Feb 19 2022 15:38:09
};
