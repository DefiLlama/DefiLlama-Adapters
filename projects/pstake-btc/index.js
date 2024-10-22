const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");

const owner = ["bc1qajcp935tuvqakut95f0sc9qm09hxjj6egexl9d", "bc1pzq0ve6e7j6jt4ckx8uzdjyddrfda9ew8dxvrjmkxmfnj9yz68zeqgqh9cl", "bc1pjp9pg0d6wcejlg576st4s8d424zx443mdumdhvjcxx5ehnfk4xcqyru7ay", "bc1px92pntcj0wd5076nnymp787a7qczsaauuefgntxngdwvkd584xgsaagem2", "bc1pxhkczd3jq9nq50p2xll99edhxlx5dj6ztgw5pgtzszjtlvg7tl4s8ttf04"];

module.exports = {
  methodology: `Total amount of BTC in ${owner.join(", ")}. Restaked on babylon`,
  doublecounted:true,
  bitcoin: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owner })]),
  },
};
