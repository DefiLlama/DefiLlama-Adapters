const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
const sdk = require("@defillama/sdk")

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x947D83b35Cd2e71df4aC7B359C6761B07d0bce19) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  arbitrum: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: '0xbC467D80AD6401dC25B37EB86F5fcd048Ae4BF6d', chain: 'arbitrum', useDefaultCoreAssets: true }),
      getUniTVL({ factory: '0x947D83b35Cd2e71df4aC7B359C6761B07d0bce19', chain: 'arbitrum', useDefaultCoreAssets: true }),
    ]),
    staking: staking("0x73c1fb66b4e183bc101b98d4c17431b667d85958", "0x602eb0d99a5e3e76d1510372c4d2020e12eaea8a", "arbitrum")
  },
}; // node test.js projects/oasisswapdex/index.js