const { default: axios } = require("axios");

const TVL_KEY = "TVL (locked)";
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

async function tvl() {
  let aumValue = (await axios.get(api)).data.data;
  const values = Object.values(aumValue);

  const flattened = flatten(values);
  const value = getValueForKey(flattened, TVL_KEY);
  return { usd: value };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
};
