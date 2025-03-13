const { get } = require("./helper/http");

const TVL_API_URL = "https://mainnet-api.yuzu.finance/v1/tvl";

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in Yuzu CLMM.",
  move: {
    tvl: async api => {
      const response = await get(TVL_API_URL);
      const tvl = response.data.tvl;
      api.tvl = tvl;
    }
  }
};
