const axios = require("axios");
const BigNumber = require('bignumber.js')
const { toUSDTBalances } = require("../helper/balances");

async function getTvl() {
  const massetAddress = '0x1440d19436bEeaF8517896bffB957a88EC95a00F';
  const apiKey = 'ckey_a88d61b514564402b9eece2017c';
  const prec = new BigNumber(10).pow(18);
  const url =
    `https://api.covalenthq.com/v1/30/address/${massetAddress}/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=${apiKey}`;
  const result = await axios.get(url);
  return result.data.data.items.reduce(
    (p, c) => p.plus(new BigNumber(c.balance)),
    new BigNumber(0))
    .div(prec);
}



module.exports = {
  fetch: getTvl
};
