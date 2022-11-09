const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: getUniTVL({
      chain: 'optimism',
      factory: '0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E',
      useDefaultCoreAssets: true,
      skipPair: [67],
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      chain: 'arbitrum',
      factory: '0x9e343Bea27a12B23523ad88333a1B0f68cc1F05E',
      useDefaultCoreAssets: true,
    }),
  },
  methodology:
    "Factory addresses on Optimism and Arbitrum are used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
