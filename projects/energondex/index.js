const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL, staking } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const uniTvl = getUniTVL({ factory: '0xBfAe4f07C099798F23f5aC6773532fB637B68Ad7', useDefaultCoreAssets: true,  })
const masterchef  = '0x8b804321b8D094D8C9bB3bFF8CC580087E8d13E0'
const egd = '0xF8F85beB4121fDAa9229141e5D5e4B782d8819D8'
const weth = ADDRESSES.base.WETH

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: sdk.util.sumChainTvls([uniTvl, staking({
      owners: [masterchef],
      tokens: [weth],
    })]),
    staking: staking({
      owners: [masterchef],
      tokens: [egd],
      lps: ['0x7A7923281B5E56c41b11393689Be1d74E79098c0'],
      useDefaultCoreAssets: true,
    })
  }
};