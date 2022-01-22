const utils = require("../helper/utils");

const api_galatea = "https://api.galatea.cash/api";

async function fetch() {
  var tvl = (await utils.fetchURL(api_galatea)).data.tvl;
  return 0;
}

async function pool2() {
  var pool2 = (await utils.fetchURL(api_galatea)).data.networks.map(
    (p) => p.stats.pools
  );
  return pool2;
}

async function staking() {
    var staking = (await utils.fetchURL(api_galatea)).data.networks.map(
      (p) => p.stats.boardroom.tvl
    );
    return staking;
  }

module.exports = {
  pool2: {
    fetch: pool2,
  },
  staking: {
    fetch: staking,
  },
  fetch,
};
