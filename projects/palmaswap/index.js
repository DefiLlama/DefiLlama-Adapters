const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0xb8b9a4d9beE1fB41b03edfa47640b1dadF49EDd2', useDefaultCoreAssets: true,  })
const masterchef  = '0x41338973c89Aa4bb47aFDCb29c5D74F81b8416A4'
const palma = '0xC2B82A3b2240509D54FbF3f1AC9fc2cA094a6f9c'
const weth = ADDRESSES.core.WCORE

module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1679356800, "Rug Pull"]
  ],
  core: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchef],
      tokens: [palma],
      lps: ['0x0D2055199924040BE0F0B855C9F4effaf5C1393e'],
      useDefaultCoreAssets: true,
    })
  }
};
