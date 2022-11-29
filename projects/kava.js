const { get } = require('./helper/http')

async function tvl() {
  let balances = {};

  let deposits = (await get('https://api2.kava.io/cdp/totalCollateral')).result;
  for (let i = 0; i < deposits.length; i++) {
    const info = convertSymbol(deposits[i].amount.denom);
    if (info.id in balances) {
      balances[info.id] = Number(balances[info.id]) + 
        Number(deposits[i].amount.amount / 10 ** info.decimals);
    } else {
      balances[info.id] = deposits[i].amount.amount / 10 ** info.decimals;
    };
  };
  
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
    case 'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C':
      return {id: 'terra-usd', decimals: 6};
    default:
      console.log(symbol);
  };
};

module.exports = {
  timetravel: false,
  kava: { tvl }
};