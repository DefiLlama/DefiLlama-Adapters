const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
module.exports = {
  methodology: "TVL is calculated by aggregating the market value of BNB tokens held within the Token Sale Factory smart contract.",
  start: 42593135,
  bsc: {
    tvl: sumTokensExport({ owner: '0x8341b19a2A602eAE0f22633b6da12E1B016E6451', token: nullAddress })
  }
};
