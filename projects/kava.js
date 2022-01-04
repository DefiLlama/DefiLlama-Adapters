const retry = require('./helper/retry')
const axios = require("axios");

async function tvl() {
  let balances = {};

  let deposits = (await retry(async bail => 
    await axios.get('https://api.kava.io/cdp/totalCollateral'))).data.result;
  for (let i = 0; i < deposits.length; i++) {
    const info = convertSymbol(deposits[i].amount.denom);
    if (info.id in balances) {
      balances[info.id] = Number(balances[info.id]) + 
        Number(deposits[i].amount.amount / 10 ** info.decimals);
    } else {
      balances[info.id] = deposits[i].amount.amount / 10 ** info.decimals;
    };
  };

  // let borrowed = (await retry(async bail => 
  //   await axios.get('https://api.kava.io/cdp/totalPrincipal'))).data.result;
  // for (let i = 0; i < borrowed.length; i++) {
  //   const symbol = borrowed[i].collateral_type.substring(
  //     0, borrowed[i].collateral_type.indexOf('-'));
  //   const info = convertSymbol(symbol);
  //   const tokenPrice = (await retry(async bail => await axios.get(
  //     `https://api.coingecko.com/api/v3/simple/price?ids=${info.id}&vs_currencies=usd`
  //     ))).data[info.id].usd;
  //   const borrowedQty = borrowed[i].amount.amount / (tokenPrice * 10 ** 6);
  //   balances[info.id] = Number(balances[info.id]) - Number(borrowedQty);
  // };
  return balances;
};

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
};
// node test.js projects/kava.js