const { getUniTVL, staking, } = require('../helper/unknownTokens')

module.exports = {
      misrepresentedTokens: true,
  methodology:
    'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph plus the total amount in dollars of our staking pools xHermes and sHermes.',
  harmony: {
    tvl: getUniTVL({
      factory: '0xfe5e54a8e28534fffe89b9cfddfd18d3a90b42ca',
      useDefaultCoreAssets: true,
    }),
    staking: staking({
      owners: ['0x28a4e128f823b1b3168f82f64ea768569a25a37f', '0x8812420fb6e5d971c969ccef2275210ab8d014f0'],
      tokens: ['0xba4476a302f5bc1dc4053cf79106dc43455904a3'],
      useDefaultCoreAssets: true,
      lps: ['0x8604197eb7123888b551fe78a8828b895608d093'],
    }),
  },
};
