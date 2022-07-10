const { getUniTVL, staking, } = require('../helper/unknownTokens')

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph plus the total amount in dollars of our staking pools xHermes and sHermes.',
  harmony: {
    tvl: getUniTVL({
      factory: '0xfe5e54a8e28534fffe89b9cfddfd18d3a90b42ca',
      chain: 'harmony',
      coreAssets: [
        '0x985458e523db3d53125813ed68c274899e9dfab4',
        '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a',
        '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
      ],
    }),
    staking: staking({
      owners: ['0x28a4e128f823b1b3168f82f64ea768569a25a37f', '0x8812420fb6e5d971c969ccef2275210ab8d014f0'],
      tokens: ['0xba4476a302f5bc1dc4053cf79106dc43455904a3'],
      chain: 'harmony',
      coreAssets: [
        '0x985458e523db3d53125813ed68c274899e9dfab4',
      ],
      lps: ['0x8604197eb7123888b551fe78a8828b895608d093'],
    }),
  },
};
