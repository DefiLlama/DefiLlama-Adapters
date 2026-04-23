const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology:
    "TVL is ctUSD deposited in the SignalsCore contract as liquidity for range-based prediction markets on Citrea.",
  citrea: {
    tvl: sumTokensExport({ owner: '0x516312275875932ec2B53A41df4De02743131729', tokens: [ADDRESSES.citrea.CTUSD] })
  },
};