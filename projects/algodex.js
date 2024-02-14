
const { searchAccountsAll } = require("./helper/chain/algorand")

const algoOrderbookId = 354073718
const asaOrderbookId = 354073834

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async (_, _1, _2, { api }) => {
      await searchAccountsAll({appId: algoOrderbookId, api, sumTokens: true, })
      await searchAccountsAll({appId: asaOrderbookId, api, sumTokens: true, })
    },
  },
};
