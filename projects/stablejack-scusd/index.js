const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const stablejackWTokens = [
  '0x0238E736166e07D6F857A0E322dAd4e7C1AFF4F3',
];

async function stablejackTVL(api) {
  const totalUnderlyingValues = await api.multiCall({
    abi: 'function totalUnderlying() view returns (uint256)',
    calls: stablejackWTokens,
  });

  stablejackWTokens.forEach((wToken, i) => 
    api.add(wToken, totalUnderlyingValues[i])
  );

  return api.getBalances();
}

module.exports = {
  timetravel: true,
  methodology:
    "TVL includes scUSD, STS, wOS held in various contracts. Also includes wstkscUSD tokens in the vault, converted to scUSD via convertToAssets(). For Goat chain, includes totalUnderlying() from StableJack WToken contracts such as artBTC wrapper, priced as BTCB since artBTC price is not indexed.",
  start: 1719292800, // 2024-06-25
  sonic: {
    tvl: async (api) => {
      const tokensAndOwners = [
        [ADDRESSES.sonic.scUSD, '0xf41ECda82C54745aF075B79b6b31a18dD986BA4c'],
        [ADDRESSES.sonic.STS, '0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155'],
        ['0x9f0df7799f6fdad409300080cff680f5a23df4b1', '0x0A6F4c98D087445Ef92b589c6f39D22C4373615F'],
        ['0x9fb76f7ce5FCeAA2C42887ff441D46095E494206', '0xb27f555175e67783ba16f11de3168f87693e3c8f'],
      ];
      return sumTokens2({ api, tokensAndOwners });
    },
  },
  avax: {
    tvl: async (api) => {
      const tokensAndOwners = [
        ['0xDf788AD40181894dA035B827cDF55C523bf52F67', '0xf010696e0BE614511516bE0DdB89AFf06B6cA440'], // rsAVAX
        ['0x06d47F3fb376649c3A9Dafe069B3D6E35572219E', '0xC37914DacF56418A385a4883512Be8b8279c94C5'], // savUSD
      ];
      return sumTokens2({ api, tokensAndOwners });
    },
  },
  goat: {
    tvl: stablejackTVL,
  },
};
