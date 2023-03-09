const { getCache } = require('../helper/http')

const TVL_KEY = "TVL (unlocked) (L1+stables)";
const VESTING_KEY = "TVL (locked) (vesting)";
const api =
  "https://app.datawisp.io/api/exec/sheet_results/8fd98286-f0e1-4a32-91cd-d88d827ae9d7";

const flatten = (arr) => {
  return arr.reduce((acc, next) => [...acc, ...next], []);
}

const getValueForKey = (arr, key) => {
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (el[key] !== undefined) {
      return el[key];
    }
  }
  return null;
}

async function getCachedApiRespnse() {
  let apiResponse = (await getCache(api)).data;
  apiResponse = flatten(Object.values(apiResponse));

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
  timetravel: false,
  misrepresentedTokens: true,
  solana: {
    tvl, vesting,
  },
}
