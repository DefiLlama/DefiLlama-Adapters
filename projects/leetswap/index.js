const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

const defaultTvl = { tvl: getUniTVL({ factory: ADDRESSES.shibarium.BONE_4, useDefaultCoreAssets: true, }), }

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: { tvl: getUniTVL({ factory: '0xcE87E0960f4e2702f4bFFE277655E993Ae720e84', useDefaultCoreAssets: true, }), },
  canto: { tvl: getUniTVL({ factory: '0x116e8a41E8B0A5A87058AF110C0Ddd55a0ed82B7', useDefaultCoreAssets: true, }), },
  linea: { tvl: getUniTVL({ factory: '0x4DDf0fa98B5f9Bd7Cb0645c25bA89A574fe9Be8c', useDefaultCoreAssets: true, }), },
  shibarium: { tvl: getUniTVL({ factory: '0xd3Ea3BC1F5A3F881bD6cE9761cbA5A0833a5d737', useDefaultCoreAssets: true, }), },
  op_bnb: defaultTvl,
  base: { tvl: getUniTVL({ factory: '0x169C06b4cfB09bFD73A81e6f2Bb1eB514D75bB19', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sLS2', }), },
  manta: defaultTvl,
  scroll: defaultTvl,
}
