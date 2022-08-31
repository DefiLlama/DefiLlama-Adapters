const retry = require("../helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

const tvl = async () => {
  const response = await retry(
    async () =>
      await axios.get(
        "https://dao-stats.withoutdoing.com/mainnet/balances.json"
      )
  );

  const tvl = response.data[response.data.length - 1].value;
  return toUSDTBalances(tvl);
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl,
  },
};
