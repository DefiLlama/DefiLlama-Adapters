const { get } = require("../helper/http");
const sdk = require("@defillama/sdk");

let nextCursor = "";
let shouldContinue = true;
const balances = {};

module.exports = {
  ethereum: {
    start: 16945809,
    tvl: async (timestamp, block, chainBlocks, { api }) => {
      // keep calling until tvlEth is 0
      while (shouldContinue) {
        const resp = await get(
          `https://api.collection.xyz/networks/1/collections?duration=1d&limit=10&sort=tvl:desc&cursor=${nextCursor}`
        );
        const { data, cursor } = resp;
        data?.forEach(({ address, tvlEth }) => {
          if (tvlEth <= 0) {
            shouldContinue = false;
            return;
          }
          sdk.util.sumSingleBalance(balances, address, tvlEth);
        });
        nextCursor = cursor;
      }

      console.log("xxx 2", balances);
      return balances;
    },
  },
};
