const utils = require("./helper/utils");

/* * * * * * * *
 * ==> Correct adapter needs to be created.
 *
 *****************/
async function fetch() {
  var tvl = 0;
  var staked = await utils.fetchURL("https://dracula.sucks/api-v2.1/stats");
  staked.data.victimPools.map((pool) => {
    tvl += pool.tvl;
  });
  return tvl;
}

async function staking() {
  var tvl = 0;
  var staked = await utils.fetchURL("https://dracula.sucks/api-v2.1/stats");
  staked.data.stakingPools.map((pool) => {
    tvl += pool.tvl;
  });
  return tvl;
}

module.exports = {
  fetch,
  staking: {
    fetch: staking,
  },
};
