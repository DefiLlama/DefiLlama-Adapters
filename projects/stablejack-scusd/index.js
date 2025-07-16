const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.sonic.scUSD, '0xf41ECda82C54745aF075B79b6b31a18dD986BA4c'], // scUSD
        ['0xe5da20f15420ad15de0fa650600afc998bbe3955', '0x682D7F02BC57Bc64bfb36078454601Ba0Efbe155'], // stS
        ['0x9f0df7799f6fdad409300080cff680f5a23df4b1', '0x0A6F4c98D087445Ef92b589c6f39D22C4373615F'], // wOS
      ]
    }),
  },
  avax: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        ['0xDf788AD40181894dA035B827cDF55C523bf52F67', '0xf010696e0BE614511516bE0DdB89AFf06B6cA440'], // rsAVAX
        ['0x06d47F3fb376649c3A9Dafe069B3D6E35572219E', '0xC37914DacF56418A385a4883512Be8b8279c94C5'], // savUSD
      ]
    }),
  },
};
