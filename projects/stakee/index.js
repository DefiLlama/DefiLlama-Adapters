const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await call({ target: "EQD2_4d91M4TVbEBVyBF8J1UwpMJc361LKVCz6bBlffMW05o", abi: "get_pool_full_data"})
      console.log(result)
      const tonTotalSupply = parseInt(result.stack[2][1], 16)
      return { "coingecko:the-open-network": tonTotalSupply/1e9 };
    }
  }
}
