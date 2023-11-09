const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0x15fA42586c30E87CA49f0Fe262bbb73E89da1cad', useDefaultCoreAssets: true,  })
const masterchef  = '0x8b804321b8D094D8C9bB3bFF8CC580087E8d13E0'
const train = '0x52DA160e9a8CeF972FF0A797D4902eD67589f64C'
const weth = ADDRESSES.arbitrum.WETH

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchef],
      tokens: [train],
      lps: ['0xB4Fdb64D4C54eda23f2f6f8E3d5bbAd172Fd9f86'],
      useDefaultCoreAssets: true,
    })
  }
};