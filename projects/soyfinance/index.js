const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  callisto: {
    tvl: getUniTVL({
      factory: '0x9CC7C769eA3B37F1Af0Ad642A268b80dc80754c5',
      chain: 'callisto',
      useDefaultCoreAssets: true,
    })
  },
  ethereumclassic: {
    tvl: getUniTVL({
      factory: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
      chain: 'ethereumclassic',
      useDefaultCoreAssets: true,
    })
  },
  bittorrent: {
    tvl: getUniTVL({
      factory: '0xbf6c50889d3a620eb42c0f188b65ade90de958c4',
      chain: 'bittorrent',
      useDefaultCoreAssets: true,
    })
  },
  bsc: {
    tvl: getUniTVL({
      factory: '0x23675f1Ac7cce101Aff647B96d7201EfCf66E4b0',
      chain: 'bsc',
      useDefaultCoreAssets: true,
    })
  },
};