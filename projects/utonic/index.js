const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await call({ target: "EQAfF5j3JMIpZlLmACv7Ub7RH7WmiVMuV4ivcgNYHvNnqHTz", abi: "get_minter_data"})
      return { "coingecko:the-open-network": result[0]/1e9 };
    }
  }
}