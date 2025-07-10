
const { getConnection, sumTokens2 } = require("../helper/solana.js");

module.exports = {
  bsc: {
    tvl: async (api) => {
      const balances = await sumTokens2({api, tokenAccounts:['9XHNuy6oux6wu5FxMmqp5CWkigTy47MectU6QWPYegD3']})
      return balances
    },
  },

}