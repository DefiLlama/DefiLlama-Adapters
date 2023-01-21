const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = "0x010DBe4482028084B3fab29305a95Ef55fF25F48"

module.exports = {
  methodology: "Count TVL as liquidity on the dex",
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      factory: FACTORY,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
  }
} 