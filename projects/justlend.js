const retry = require('./helper/retry');
const axios = require('axios');
const { toUSDTBalances } = require('./helper/balances');

async function core() {
  const response = (
    await retry(
      async (bail) => await axios.get(
        'https://labc.ablesdxd.link/justlend/markets/dashboard')
    )
  ).data.data;

  const tvl = response.totalDepositedUSD - response.totalBorrowedUSD;

  return toUSDTBalances(tvl);
};

async function historical() {
  const response = (
    await retry(
      async (bail) => await axios.get(
        'https://labc.ablesdxd.link/justlend/markets/dashboard')
    )
  ).data.data;

  const tvl = response.totalDepositedUSD - response.totalBorrowedUSD;

  return toUSDTBalances(tvl);
};

// node test.js projects/justlend.js
async function pool2() {
  const response = (
    await retry(
      async (bail) => await axios.get(
        'https://apilist.tronscan.org/api/defiTvl')
    )
  ).data;

  const justLend = (response.projects.filter(
    p => p.project == "JustLend"))[0];

  const coreTVL = await core();

  if (coreTVL > 0) {
    return justLend.locked - coreTVL;
  } else {
    return 0;
  };
};
module.exports = {
  misrepresentedTokens: true,
  tron: {
    tvl: core,
    pool2,
  },
};
