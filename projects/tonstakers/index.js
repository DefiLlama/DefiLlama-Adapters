const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await call({ target: "EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR", abi: "get_pool_full_data"})
      console.log(result)
      const tonTotalSupply = parseInt(result.stack[2][1], 16)
      return { "coingecko:the-open-network": tonTotalSupply/1e9 };
    }
  }
}