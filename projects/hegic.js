var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const BigNumber = require("bignumber.js");
const utils = require('./helper/utils');



async function fetch() {
  let ethPool = '0x878f15ffc8b894a1ba7647c7176e4c01f74e140b';
  let btcPool = '0x20DD9e22d22dd0a6ef74a520cb08303B5faD5dE7';
  let btcAmount = await utils.returnBalance('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', btcPool);
  let getethBalanceRes = await web3.eth.getBalance(ethPool);
  let price_feed = await utils.getPricesfromString('bitcoin,ethereum');
  let ethAmount = new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
  let tvl = (price_feed.data.bitcoin.usd * btcAmount) + (ethAmount * price_feed.data.ethereum.usd)
  return tvl;

}


module.exports = {
  fetch
}
