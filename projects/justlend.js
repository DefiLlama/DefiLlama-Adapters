const retry = require('./helper/retry');
const axios = require('axios');

async function core() {
  const response = (
    await retry(
      async (bail) => await axios.get(
          'https://labc.ablesdxd.link/justlend/markets/dashboard')
    )
  ).data.data;

  const tvl = response.totalDepositedUSD - response.totalBorrowedUSD;

  return tvl || 0;
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
        return justLend.locked - coreTVL || 0;
    } else {
        return 0;
    };
  };
module.exports = {
    tron: {
        fetch: core,
    },
    pool2: {
        fetch: pool2
    }
};
