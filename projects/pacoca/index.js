const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

async function bsc() {
  return toUSDTBalances(
    (await axios("https://api-v2.pacoca.io/statistics")).data.tvl
  );
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bsc,
  },
  tvl: bsc,
};
