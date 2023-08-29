// const { getAdaInAddress } = require("../helper/chain/cardano");
const axios = require("axios");


const POOL_ID = "pool1drkls8s0zzjydyv3qpjsdj58w3sw02w9wg0pckrsnuazyef2hca"
// TODO  Waiting for dex to deploy the main network
// const DEX_BATHCER_SCRIPT = ""
// const DEX_POOL_SCRIPT = ""

async function tvl() {
  // const batchOrderLocked = await getAdaInAddress(DEX_BATHCER_SCRIPT)
  // const liquidityPoolLocked = await getAdaInAddress(DEX_POOL_SCRIPT)
  const ISPOLocked = await getPoolStake(POOL_ID)
  return {
    // cardano: ISPOLocked + (liquidityPoolLocked * 2) + batchOrderLocked,
    cardano: ISPOLocked,
  };
}

async function getPoolStake(poolId) {
  try {
    // https://api.koios.rest/#post-/pool_info
    const response = await axios.post('https://api.koios.rest/api/v0/pool_info', {
      "_pool_bech32_ids": [poolId]
    });
    return response.data[0].live_stake / 1e6;
  } catch (error) {
    console.error('Error fetching pool info:', error);
    throw error;
  }
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
