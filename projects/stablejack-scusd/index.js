const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL includes scUSD, STS, wOS, and wstkscUSD on Sonic and Avalanche chains. Also includes artBTC held by SJ-wartBTC wrapper contract on Goat chain.",

  sonic: {
    tvl: async (api) => {
      const tokensAndOwners = [
        [ADDRESSES.sonic.scUSD, '0xf41ECda82C54745aF075B79b6b31a18dD986BA4c'], // scUSD
        [ADDRESSES.sonic.STS, '0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155'], // stS
        ['0x9f0df7799f6fdad409300080cff680f5a23df4b1', '0x0A6F4c98D087445Ef92b589c6f39D22C4373615F'], // wOS
        ['0x9fb76f7ce5FCeAA2C42887ff441D46095E494206', '0xb27f555175e67783ba16f11de3168f87693e3c8f'], // wstkscUSD
      ];

      return api.sumTokens({ tokensAndOwners });
    },
  },

  avax: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xDf788AD40181894dA035B827cDF55C523bf52F67', '0xf010696e0BE614511516bE0DdB89AFf06B6cA440'], // rsAVAX
        ['0x06d47F3fb376649c3A9Dafe069B3D6E35572219E', '0xC37914DacF56418A385a4883512Be8b8279c94C5'], // savUSD
      ],
    }),
  },

  goat: {
    tvl: async (api) => {
      const artBTC = '0x02F294cC9Ceb2c80FbA3fD779e17FE191Cc360C4'; // artBTC
      const sjWartBTC = '0x0238E736166e07D6F857A0E322dAd4e7C1AFF4F3'; // SJ-wartBTC (wrapper contract)

      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: artBTC,
        params: [sjWartBTC],
      });

      api.add(artBTC, balance);
      return api.getBalances();
    },
  },
};
