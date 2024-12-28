const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  callisto: {
    tvl: getUniTVL({
      factory: '0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5',
      useDefaultCoreAssets: true,
      blacklistedTokens: [ADDRESSES.callisto.SOY]
    })
  },
  ethereumclassic: {
    tvl: getUniTVL({
      factory: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
      useDefaultCoreAssets: true,
    })
  },
  bittorrent: {
    tvl: getUniTVL({
      factory: ADDRESSES.callisto.BUSDT,
      useDefaultCoreAssets: true,
    })
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
      useDefaultCoreAssets: true,
    })
  },
};