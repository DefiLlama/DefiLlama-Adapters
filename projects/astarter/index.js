const axios = require("axios");

const POOL_ID = ["pool1drkls8s0zzjydyv3qpjsdj58w3sw02w9wg0pckrsnuazyef2hca","pool1yemdr25t4g3ev038yn433dt58d8p52nee7kmcykjlhye6hshu9m"];
async function tvl() {
  return {
    cardano: await getPoolStake(POOL_ID)
  };
}

async function getPoolStake(poolIds) {
  const response = await axios.post('https://api.koios.rest/api/v1/pool_info', {
    "_pool_bech32_ids": poolIds
  });
  return response.data.reduce((a, b) => a + b.live_stake / 1e6, 0);
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
