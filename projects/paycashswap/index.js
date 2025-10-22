const utils = require("../helper/utils");

// https://paycashswap.com
// https://api.paycashswap.com
async function eos(api) {
  // Get total pool liquidity which represents the actual AMM pool TVL
  const liquidityQuery = {
    operationName: "TotalLiquidity",
    variables: {},
    query: "query TotalLiquidity { totalLiquidityChart { value24h } }"
  }
  
  const { data: { data: { totalLiquidityChart: { value24h } } } } = await utils.postURL("https://api.paycashswap.com/", liquidityQuery);
  
  // Use the pool liquidity value directly
  const poolTvl = Number(value24h);
  api.addUSDValue(poolTvl);
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `PayCash Swap TVL is achieved by making a call to its PayCash Swap API and using the totalLiquidityChart.value24h which represents the actual AMM pool liquidity.`,
  eos: {
    tvl: eos
  },
}
