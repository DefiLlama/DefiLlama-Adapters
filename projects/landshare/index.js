
const { toUSDTBalances } = require('../helper/balances');
const { get } = require('../helper/http');

const LandshareApi = "https://api.landshare.io/api/properties";

async function landshareTVL() {
  const rentals = await get(LandshareApi + "/rentals");
  const flips = await get(LandshareApi + "/flips");

  const totalRentals = rentals.reduce((acc, item) => {
    acc = acc + item.value
    return acc;
  }, 0);

  const totalFlips = flips.reduce((acc, item) => {
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
