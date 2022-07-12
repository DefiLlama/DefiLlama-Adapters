const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xF2Fb1b5Be475E7E1b3C31082C958e781f73a1712',
      coreAssets: [
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
        '0x55d398326f99059ff775485246999027b3197955', // USDT
      ],
    }),
  },
  bittorrent: {
    tvl: getUniTVL({
      chain: 'bittorrent',
      factory: '0x4dEb2f0976DC3Bf351555524B3A24A4feA4e137E',
      coreAssets: [
        '0x23181f21dea5936e24163ffaba4ea3b316b57f3c', // BTT
        '0xedf53026aea60f8f75fca25f8830b7e2d6200662', // TRX
      ],
    }),
  },
  polygon: {
    tvl: getUniTVL({
      chain: 'polygon',
      factory: '0xD36ABA9EC96523B0A89886C76065852ADFE2EB39',
      coreAssets: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // MATIC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
      ],
    }),
  },
  // tron: {
  //   tvl: @todo
  // },
}
