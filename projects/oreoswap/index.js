const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x20fAfD2B0Ba599416D75Eb54f48cda9812964f46', useDefaultCoreAssets: true })
const masterchef  = '0xa481384653c484901b301634086c8625e550bbec'
const masterchefOld  = '0xeb66b69d1cc6ef04575a11d4b0a6427b1cdacc45'
const oreo = '0x319e222De462ac959BAf2aEc848697AeC2bbD770'
const weth = ADDRESSES.arbitrum.WETH

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchefOld, masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchefOld, masterchef],
      tokens: [oreo],
    })
  }
};
