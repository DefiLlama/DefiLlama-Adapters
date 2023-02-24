const { post } = require('../helper/http')
const BigNumber = require('bignumber.js')

async function fetch() {
  const tvl = (await post("https://api.flatqube.io/v1/pairs", {
          currencyAddresses: [],
          limit: 1000,
          offset: 0,
          ordering: "tvldescending",
          whiteListUri: "https://raw.githubusercontent.com/broxus/flatqube-assets/master/manifest.json",
        })
    ).pairs.map(p => p.tvl).reduce(
      (a, c) => new BigNumber(a).plus(c));

  return tvl;
}

module.exports = {
  everscale: {
    fetch
  },
    fetch
};
