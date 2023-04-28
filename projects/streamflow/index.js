const { getCache } = require('../helper/http')

const SOLANA = "SOLANA";
const TVL_KEY = "tvl";
const VESTING_KEY = "tvl_vested";
const api =
  "https://metabase.internal-streamflow.com/_public/api/v1/stats/accumulated";

const getValueForKey = (arr, key) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].chain === SOLANA && arr[i][key] !== undefined) {
      return arr[i][key];
    }
  }
  return null;
}

async function getCachedApiRespnse() {
  let apiResponse = (await getCache(api));

  return apiResponse;
}

async function tvl() {
  return {
    tether: getValueForKey(await getCachedApiRespnse(), TVL_KEY),
  }
}
async function vesting() {
  return {
    tether: getValueForKey(await getCachedApiRespnse(), VESTING_KEY),
  }
}

module.exports = {
  methodology: 'Token breakdown: https://metabase.internal-streamflow.com/public/dashboard/fe3731c1-fbe4-4fb6-8960-515af1d6e72d', 
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl, vesting,
  },
}
