const { getUniTVL } = require('../helper/cache/uniswap.js')
const { staking } = require('../helper/staking')

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95',  hasStablePools: true, blacklistedTokens: ['0x471f79616569343e8e84a66f342b7b433b958154'] }),
    staking: staking("0x35361C9c2a324F5FB8f3aed2d7bA91CE1410893A", "0xE1da44C0dA55B075aE8E2e4b6986AdC76Ac77d73"),
  },
}