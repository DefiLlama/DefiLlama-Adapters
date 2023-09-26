const axios = require("axios");

const POOL_ID = "pool1drkls8s0zzjydyv3qpjsdj58w3sw02w9wg0pckrsnuazyef2hca";
async function tvl() {
  return {
    cardano: await getPoolStake(POOL_ID)
  };
}

async function getPoolStake(poolId) {
  const response = await axios.post('https://api.koios.rest/api/v0/pool_info', {
    "_pool_bech32_ids": [poolId]
  });
  return response.data[0].live_stake / 1e6;
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
