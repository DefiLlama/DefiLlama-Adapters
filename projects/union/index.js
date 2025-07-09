const utils = require("../helper/utils");

const url = "https://c-op-api.unn.finance/v1/pools"

const tvl = async (api) => {
  const { data } = await utils.fetchURL(url)
  data.pools.forEach(({ liquidity }) => {
    api.addUSDValue(Math.round(liquidity))
  })
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl },
};
