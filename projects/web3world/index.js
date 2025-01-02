const { post } = require('../helper/http')
const BigNumber = require('bignumber.js')

async function fetch() {
  const tvl = (await post("https://api.web3.world/v2/pools", {
          limit: 1000,
          offset: 0,
          ordering: "tvldescending",
          whiteListUri: "https://static.web3.world/assets/manifest.json",
        })
    ).pools.map(p => p.tvl).reduce(
      (a, c) => new BigNumber(a).plus(c));

  return tvl;
}

module.exports = {
  venom: {
    fetch
  },
    fetch
};
