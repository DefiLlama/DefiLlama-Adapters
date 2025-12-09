const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

const XRP_ADDRESSES = [
"rKopBmtBSMmUD6NCFNwGTG3b9ZxNzf7Tt4",
"rU1DGbMWhrFSJLPcrtKuV5iPyD1wrVgeaU",
"rMbVVXFHaBpSpJhdR1xvy7dkQL1gtnkopg",
"rGsMk4nK4M8MtcjVbjUeaJBppjjKpXyJ7F"
];

module.exports = {
  methodology: "XRP collateral backing CBXRP https://www.coinbase.com/en-in/cbxrp/proof-of-reserves",
  ripple: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: XRP_ADDRESSES }),
    ]),
  },
};