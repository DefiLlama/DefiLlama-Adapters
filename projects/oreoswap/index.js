const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x20fAfD2B0Ba599416D75Eb54f48cda9812964f46', useDefaultCoreAssets: true })
const masterchef  = '0xa481384653c484901b301634086c8625e550bbec'
const masterchefOld  = '0xeb66b69d1cc6ef04575a11d4b0a6427b1cdacc45'
const oreo = '0x319e222De462ac959BAf2aEc848697AeC2bbD770'
const weth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'

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
      onlyLPs: true,
      lps: ['0xBf6a0418e31f90b60ae3d19c56a659ad8b2f4D18'],
      useDefaultCoreAssets: true,
    })
  }
};
