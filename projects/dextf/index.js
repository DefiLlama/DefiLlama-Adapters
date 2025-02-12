const TVLV1 = require('./v1');
const tvlV2 = require('./v2');
const sdk = require('@defillama/sdk');

module.exports = {
  start: '2020-07-27', // 27/07/2020 @ 12:43:45am (UTC)
  ethereum: { tvl: sdk.util.sumChainTvls([TVLV1, tvlV2]) },
  avax: { tvl: tvlV2 },
  era: { tvl: tvlV2 }
}