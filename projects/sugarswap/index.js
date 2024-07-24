const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x1486397B3C0e6fEB8c483faD2F03E8c404cAEDe7', useDefaultCoreAssets: true })
const masterchef  = '0x45eecDADa0B58B0E78F94549F65FDAF447b35c17'
const sugar = '0xd3ccBF3867FF0204730173eB4cad3C4B5fd07c69'
const weth = ADDRESSES.arbitrum.WETH

module.exports = {
  hallmarks: [
    [1673827200, "Rug Pull"]
  ],
  misrepresentedTokens: true,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchef],
      tokens: [sugar],
      lps: ['0xD184aAbFc9De6B56994D1283ed4C132B70A73a14'],
      useDefaultCoreAssets: true,
    })
  }
};