const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");

const owner = ["bc1qajcp935tuvqakut95f0sc9qm09hxjj6egexl9d", "bc1pzq0ve6e7j6jt4ckx8uzdjyddrfda9ew8dxvrjmkxmfnj9yz68zeqgqh9cl", "bc1pjp9pg0d6wcejlg576st4s8d424zx443mdumdhvjcxx5ehnfk4xcqyru7ay"];

module.exports = {
  methodology: `Total amount of BTC in ${owner}.`,
  bitcoin: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owner })]),
  },
};