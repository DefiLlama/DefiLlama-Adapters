const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology:
    "TVL is ctUSD deposited in the SignalsCore contract as liquidity for range-based prediction markets on Citrea.",
  citrea: {
    tvl: sumTokensExport({ owner: '0x516312275875932ec2B53A41df4De02743131729', tokens: ["0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D"] })
  },
};