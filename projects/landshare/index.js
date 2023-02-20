
const { toUSDTBalances } = require('../helper/balances');
const axios = require("axios");

const LandshareApi = "https://api.landshare.io/api/properties";

async function landshareTVL() {
  const rentals = await axios.get(LandshareApi + "/rentals");
  const flips = await axios.get(LandshareApi + "/flips");

  const totalRentals = rentals.data.reduce((acc, item) => {
    acc = acc + item;
    return acc;
  }, 0);

  const totalFlips = rentals.data.reduce((acc, item) => {
    acc = acc + item;
    return acc;
  }, 0);

  const total = totalRentals + totalFlips;

  return toUSDTBalances(total);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc: {
    tvl: landshareTVL,
  }
};

// node test.js projects/landshare/index.js
