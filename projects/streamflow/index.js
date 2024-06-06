const { getCache } = require('../helper/http')

const TVL_KEY = "tvl";
const VESTING_KEY = "tvl_vested";
const api =
  "https://metabase.internal-streamflow.com/_public/api/v1/stats/accumulated";
const chains = [
  "solana",
  "aptos",
  "bsc",
  "polygon",
  "ethereum",
];
const chainMapping = {
  bsc: 'bnb'
};

const getValueForKey = (arr, chain, key) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].chain.toLowerCase() === (chainMapping[chain] || chain) && arr[i][key] !== undefined) {
      return arr[i][key];
    }
  }
  return 0;
}

async function getCachedApiRespnse() {
  let apiResponse = (await getCache(api));

  return apiResponse;
}

async function tvl(api) {
  return {
    tether: getValueForKey(await getCachedApiRespnse(), api.chain, TVL_KEY),
  }
}
async function vesting(api) {
  return {
    tether: getValueForKey(await getCachedApiRespnse(), api.chain, VESTING_KEY),
  }
}

module.exports = {
  methodology: 'Token breakdown: https://metabase.internal-streamflow.com/public/dashboard/fe3731c1-fbe4-4fb6-8960-515af1d6e72d', 
  timetravel: false,
  misrepresentedTokens: true,
}
chains.forEach((chain) => {
  module.exports[chain] = {
    tvl, vesting
  };
});
