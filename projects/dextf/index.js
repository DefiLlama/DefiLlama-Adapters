const TVLV1 = require('./v1');
const TVLV2 = require('./v2');
const TVLV2_AVAX = require('./v2_avax');
const TVLV2_ERA = require('./v2_era');
const sdk = require('@defillama/sdk');

module.exports = {
  start: 1595853825, // 27/07/2020 @ 12:43:45am (UTC)
  ethereum: { tvl: sdk.util.sumChainTvls([TVLV1, TVLV2]) },
  avax: { tvl: sdk.util.sumChainTvls([TVLV2_AVAX]) },
  era: { tvl: sdk.util.sumChainTvls([TVLV2_ERA]) }
}