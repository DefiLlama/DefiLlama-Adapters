const utils = require('./helper/utils');

async function tvl() {
  var totalTvl = (await utils.fetchURL('https://stats.zilswap.org/liquidity'))?.data?.reduce((prev,curr) => prev + (Number(curr?.amount) * 10**-12 ?? 0), 0); 
  return {
    zilliqa: totalTvl
  };
}

module.exports = {
  zilliqa: {
    tvl,
  },
  methodology: `ZilSwap TVL is achieved by making a call to its API: https://stats.zilswap.org/liquidity`,
  misrepresentedTokens: true,
  timetravel: false,
}
