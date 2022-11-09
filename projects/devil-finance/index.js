const retry = require("../helper/retry");
const axios = require("axios");

function tvl(type) {
  return async () => {
    var response = await retry(
      async (_) => await axios.get("https://devilfinance.io/api/tvls")
    );

    return { tether: response.data[type] };
  };
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  fantom: {
    tvl: tvl("nonNative"),
    pool2: tvl("nativeLP"),
    staking: tvl("native"),
  },
};
