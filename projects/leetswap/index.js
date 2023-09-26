const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: { tvl: getUniTVL({ factory: '0xcE87E0960f4e2702f4bFFE277655E993Ae720e84', useDefaultCoreAssets: true,  }), },
  canto: { tvl: getUniTVL({ factory: '0x116e8a41E8B0A5A87058AF110C0Ddd55a0ed82B7', useDefaultCoreAssets: true,  }), },
  linea: { tvl: getUniTVL({ factory: '0x4DDf0fa98B5f9Bd7Cb0645c25bA89A574fe9Be8c', useDefaultCoreAssets: true,  }), },
  shibarium: { tvl: getUniTVL({ factory: '0xd3Ea3BC1F5A3F881bD6cE9761cbA5A0833a5d737', useDefaultCoreAssets: true,  }), },
  op_bnb: { tvl: getUniTVL({ factory: '0xa2899c776bAAF9925d432F83C950D5054A6CF59C', useDefaultCoreAssets: true,  }), },
  base: { tvl: getUniTVL({ factory: '0x169C06b4cfB09bFD73A81e6f2Bb1eB514D75bB19', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sLS2', }), },
  manta: { tvl: getUniTVL({ factory: '0xa2899c776bAAF9925d432F83C950D5054A6CF59C', useDefaultCoreAssets: true,  }), },
}
