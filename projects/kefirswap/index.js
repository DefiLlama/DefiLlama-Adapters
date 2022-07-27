const { getUniTVL } = require('../helper/unknownTokens')

// const KEFIR = "0xf5E547C683f5d72D6A463542d3e2cC13C5470D71"
const FACTORY = "0xeEAbe2F15266B19f3aCF743E69105016277756Fb"
const WKAVA = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b"

module.exports = {
  methodology: "Count TVL as liquidity on the dex",
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({
      chain: 'kava',
      factory: FACTORY,
      coreAssets: [
        WKAVA
      ]
    }),
  }
} 
