const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await call({ target: "EQA7y9QkiP4xtX_BhOpY4xgVlLM7LPcYUA4QhBHhFZeL4fTa", abi: "getActiveContest"});
      return { "coingecko:the-open-network": result[0]/1e9 };
    },
  },
}
