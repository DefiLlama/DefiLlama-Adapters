const { default: axios } = require("axios");

const TVL_KEY = "TVL (unlocked) (L1+stables)";
const VESTING_KEY = "TVL (locked) (vesting)";
const api =
  "https://app.datawisp.io/api/exec/sheet_results/8fd98286-f0e1-4a32-91cd-d88d827ae9d7";

const flatten = (arr) => {
  return arr.reduce((acc, next) => [...acc, ...next], []);
};

const getValueForKey = (arr, key) => {
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (el[key] !== undefined) {
      return el[key];
    }
  }
  return null;
};

let apiResponse;

async function getCachedApiRespnse() {
  if (apiResponse) {
    return apiResponse;
  }

  apiResponse = (await axios.get(api)).data.data;
  apiResponse = flatten(Object.values(apiResponse));

  return apiResponse;
}

function data() {
  const _tvl = async () => {
    return {
      usd: getValueForKey(await getCachedApiRespnse(), TVL_KEY),
    };
  };
  const _vesting = async () => {
    return {
      usd: getValueForKey(await getCachedApiRespnse(), VESTING_KEY),
    };
  };

  return {
    tvl: _tvl,
    vesting: _vesting,
  };
}

console.log(data());

module.exports = {
  timetravel: false,
  solana: {
    ...data(),
  },
};
