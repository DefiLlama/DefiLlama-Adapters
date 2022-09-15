const axios = require("axios");
const retry = require("./helper/retry");

async function staking() {
  const response = (
    await retry(async (bail) => await axios.get("https://treasury-app.coti.io/get-total"))
  ).data;

  return { 
    'coti': Number(response.totalCotiInPool).toFixed(0),
  };
};

module.exports = {
  timetravel: false,
  coti: {
    tvl: async ()=> ({}),
    staking,
  }
};
