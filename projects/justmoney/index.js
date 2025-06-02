const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  bsc: {
    tvl: getUniTVL({
      factory: '0xF2Fb1b5Be475E7E1b3C31082C958e781f73a1712',
      useDefaultCoreAssets: true,
    }),
  },
  bittorrent: {
    tvl: getUniTVL({
      factory: '0x4dEb2f0976DC3Bf351555524B3A24A4feA4e137E',
      useDefaultCoreAssets: true,
    }),
  },
  ethereum: {
    tvl: getUniTVL({
      factory: '0xd36Aba9Ec96523b0A89886c76065852aDFE2Eb39',
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0xD36ABA9EC96523B0A89886C76065852ADFE2EB39',
      useDefaultCoreAssets: true,
    }),
  },
  tron: {
    tvl: getUniTVL({
      factory: 'TBfTeNjh7k8PbkTad8z6WS2vqh7SQZUfQ8',
      useDefaultCoreAssets: true,
    }),
  },
}
