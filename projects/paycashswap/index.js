const utils = require("../helper/utils");

// https://paycashswap.com
// https://api.paycashswap.com
async function eos() {
  const data = {
    operationName: "TotalLiquidity",
    variables: {},
    query: "query TotalLiquidity { totalLiquidityChart { value24h } }"
  }
  const response = await utils.postURL("https://api.paycashswap.com/", data);
  return response.data.data.totalLiquidityChart.value24h;
}

module.exports = {
  methodology: `PayCash Swap TVL is achieved by making a call to its PayCash Swap API.`,
  eos: {
    fetch: eos
  },
  fetch: eos,
}
