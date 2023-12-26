const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  methodology: "stTon",
  ton: {
    tvl: async () => {
      const result = await call({ target: "EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k", abi: "get_full_data" })
      const tonTotalSupply = parseInt(result.stack[1][1], 16)
      return { "coingecko:the-open-network": tonTotalSupply / 1e9 };
    }
  }
}
