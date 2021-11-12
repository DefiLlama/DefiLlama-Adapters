const retry = require('./helper/retry')
const axios = require("axios");
// node test.js projects/kava.js
async function tvl() {
  let balances = {};
  let feed = (await retry(async bail => 
    await axios.get('https://api.kava.io/cdp/totalCollateral'))).data.result;
  for (let i = 0; i < feed.length; i++) {
    const info = convertSymbol(feed[i].amount.denom);
    if (info.id in balances) {
      balances[info.id] = Number(balances[info.id]) + 
        Number(feed[i].amount.amount / 10 ** info.decimals);
    } else {
      balances[info.id] = feed[i].amount.amount / 10 ** info.decimals;
    };
  };
  return balances;
}

function convertSymbol(symbol) {
  switch (symbol) {
    case 'bnb':
      return {id: 'binancecoin', decimals: 8};
    case 'btcb':
      return {id: 'bitcoin', decimals: 8};
    case 'busd':
      return {id: 'binance-usd', decimals: 8};
    case 'hard':
      return {id: 'kava-lend', decimals: 6};
    case 'hbtc':
      return {id: 'bitcoin', decimals: 8};
    case 'swp':
      return {id: 'kava-swap', decimals: 6};
    case 'ukava':
      return {id: 'kava', decimals: 6};
    case 'xrpb':
      return {id: 'ripple', decimals: 8};
    default:
      console.log(symbol);
  };
};


module.exports = {
  tvl
}
