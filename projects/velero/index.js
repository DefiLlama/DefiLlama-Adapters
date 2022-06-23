const axios = require("axios");
const retry = require("../helper/retry");

async function fetch() {
  const endpoint = 'https://price.velero.finance/v1/system/total-liquidity-usd'

  return totalLiquidityUSD = (
    await retry(
      async (bail) =>
        await axios.get(endpoint)
    )
  ).data.result.totalLiquidityUSD;

}

module.exports = {
  methodology: `Finds TotalLiquidityUSD using the VeleroDAO rest endpoint "https://price.velero.finance/v1/system/total-liquidity-usd".`,
  fetch
}
