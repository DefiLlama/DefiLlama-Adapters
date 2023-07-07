const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

// const KEFIR = "0xf5E547C683f5d72D6A463542d3e2cC13C5470D71"
const FACTORY = "0xeEAbe2F15266B19f3aCF743E69105016277756Fb"
const WKAVA = ADDRESSES.kava.WKAVA

module.exports = {
  hallmarks: [
    [1656806400, "Rug Pull"]
  ],
  methodology: "Count TVL as liquidity on the dex",
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({
      chain: 'kava',
      factory: FACTORY,
      useDefaultCoreAssets: true,
    }),
  }
} 
