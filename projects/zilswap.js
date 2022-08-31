const utils = require('./helper/utils');

async function fetch() {
  var totalTvl = await (await utils.fetchURL('https://stats.zilswap.org/liquidity'))?.data?.reduce((prev,curr) => prev + (Number(curr?.amount) * 10**-12 ?? 0), 0); 
  const zilPrice = await utils.getPricesfromString("zilliqa")
  return totalTvl * zilPrice.data.zilliqa.usd;
}

module.exports = {
  fetch,
  methodology: `ZilSwap TVL is achieved by making a call to its API: https://stats.zilswap.org/liquidity`,
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: false,
  incentivized: true,
}
