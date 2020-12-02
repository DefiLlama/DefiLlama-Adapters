var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const utils = require('./helper/utils');


async function fetch() {
  var getethBalanceRes = await web3.eth.getBalance('0xFf40827Ee1c4Eb6052044101E1C6E28DBe1440e3');
  var ethAmount = await new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
  let price_feed = await utils.getPricesfromString('ethereum');
  var tvl = (parseFloat(ethAmount) * price_feed.data.ethereum.usd)
  return tvl;
}



module.exports = {
  fetch
}
