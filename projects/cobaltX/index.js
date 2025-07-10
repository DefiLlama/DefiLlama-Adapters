const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/solana.js");

module.exports = {
  soon: {
    tvl: async (api) => {
      const balances = await sumTokens2({api, owner:"6JFxidiQiWZhk5aVFETHr3mNoA5zbauxoHkGQYZL5srG"})
      return balances
    },
  },

}