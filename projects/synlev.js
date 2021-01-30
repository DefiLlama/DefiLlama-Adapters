var Web3 = require('web3');
const BigNumber = require("bignumber.js");
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const utils = require('./helper/utils');


async function fetch() {
  let getethBalanceRes = await web3.eth.getBalance('0xFf40827Ee1c4Eb6052044101E1C6E28DBe1440e3');
  let getethBalanceRes2 = await web3.eth.getBalance('0xA81f8460dE4008577e7e6a17708102392f9aD92D');

  let ethAmount = await new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
  let ethAmount2 = await new BigNumber(getethBalanceRes2).div(10 ** 18).toFixed(2);

  let totaleth = parseFloat(ethAmount) + parseFloat(ethAmount2);
  let price_feed = await utils.getPricesfromString('ethereum');
  var tvl = (totaleth * price_feed.data.ethereum.usd)
  return tvl;
}



module.exports = {
  fetch
}
