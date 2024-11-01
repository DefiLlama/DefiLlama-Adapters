const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/sumTokens");

const owners = [
  "bc1p78mvfa550t7acg6wm9cl9543zf68ulhqkxex5pvhv8wnw4qpl3gqmpjy2s"
];

module.exports = {
  methodology: "Staking tokens via Babylon counts as TVL",
  doublecounted:true,
  bitcoin: {
    tvl: sdk.util.sumChainTvls([sumTokensExport({ owners })]),
  }}