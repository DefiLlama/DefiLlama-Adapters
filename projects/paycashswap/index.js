const utils = require("../helper/utils");

// https://paycashswap.com
// https://api.paycashswap.com
async function eos(api) {
  const data = {
    operationName: "TotalLiquidity",
    variables: {},
    query: "query TotalLiquidity { totalLiquidityChart { value24h } token(id:100) {liquidity} }"
  }
  const { data: { data: { totalLiquidityChart: { value24h }, token: { liquidity } } } } = await utils.postURL("https://api.paycashswap.com/", data);
  api.addUSDValue(value24h - liquidity)  // exclude self-issued tokens
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `PayCash Swap TVL is achieved by making a call to its PayCash Swap API.`,
  eos: {
    tvl: eos
  },
}
