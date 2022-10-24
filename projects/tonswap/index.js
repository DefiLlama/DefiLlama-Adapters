const retry = require("../helper/retry");
const axios = require("axios");
const BigNumber = require('bignumber.js')

async function fetch() {
  const tvl = (await retry(async (bail) =>
        await axios.post("https://api.flatqube.io/v1/pairs", {
          currencyAddresses: [],
          limit: 1000,
          offset: 0,
          ordering: "tvldescending",
          whiteListUri: "https://raw.githubusercontent.com/broxus/flatqube-assets/master/manifest.json",
        })
    )).data.pairs.map(p => p.tvl).reduce(
      (a, c) => new BigNumber(a).plus(c));

  return tvl;
};

module.exports = {
    fetch
};
