const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')
module.exports = {
  methodology: "TVL is calculated by aggregating the market value of BNB tokens held within the Token Sale Factory smart contract.",
  bsc: {
    tvl: sumTokensExport({ owner: '0x8341b19a2A602eAE0f22633b6da12E1B016E6451', token: nullAddress })
  },
  ethereum: {
    tvl: sumTokensExport({ owner: '0xb8540a7d74Cc4912443e8c4B2064B640FC763c4f', token: nullAddress })
  }
};
