const retry = require("../helper/retry");
const axios = require("axios");

function tvl(type) {
  return async () => {
    var response = await retry(
      async (_) => await axios.get("https://devilfinance.io/api/tvls")
    );

    return response.data[type];
  };
};

module.exports = {
  fantom: {
    fetch: tvl("nonNative"),
  },
  pool2: {
    fetch: tvl("nativeLP"),
  },
  staking: {
    fetch: tvl("native"),
  },
  fetch: tvl("nonNative"),
};
