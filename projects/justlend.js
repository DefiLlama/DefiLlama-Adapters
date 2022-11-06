const retry = require('./helper/retry');
const axios = require('axios');
const { toUSDTBalances } = require('./helper/balances');

function core(borrowed){
return async () => {
  const response = (
    await retry(
      async (bail) => await axios.get(
        'https://labc.ablesdxd.link/justlend/markets/dashboard')
    )
  ).data.data;

  const tvl = response.totalDepositedUSD - response.totalBorrowedUSD;

  return toUSDTBalances(borrowed? response.totalBorrowedUSD : tvl);
};
}

// node test.js projects/justlend.js
async function pool2() {
  const response = (
    await retry(
      async (bail) => await axios.get(
        'https://apilist.tronscan.org/api/defiTvl')
    )
  ).data;

  const justLend = (response.projects.filter(
    p => p.project == "JustLend DAO"))[0];

  const coreTVL = await (core())(false);

  if (coreTVL['0xdac17f958d2ee523a2206206994597c13d831ec7'] > 0) {
    return justLend.locked - coreTVL;
  } else {
    return 0;
  };
};
module.exports = {
  misrepresentedTokens: true,
  tron: {
    tvl: core(false),
    borrowed: core(true),
    //pool2,
  },
};
