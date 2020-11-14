var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");
const abis = require('./config/abis.js')
const utils = require('./helper/utils');


let coins = [
  {
    '0x6b175474e89094c44da98b954eedeac495271d0f': '18' //DAI
  }
]

let keys = [
  {

    '0x6b175474e89094c44da98b954eedeac495271d0f': 'stable'

  }
]




async function fetch() {

  var price_feed = await utils.getPrices(keys);

  var balanceCheck = '0x49244bd018ca9fd1f06ecc07b9e9de773246e5aa';
  var tvl = 0;
  for (var key in coins[0]) {
    var dacontract = new web3.eth.Contract(abis.abis.minABI, key)
    var balances = await dacontract.methods.balanceOf(balanceCheck).call();
    balances = await new BigNumber(balances).div(10 ** coins[0][key]).toFixed(2);
    if (keys[0][key] != 'stable') {
      tvl += (parseFloat(balances) * price_feed.data[keys[0][key]].usd)
    } else {
      tvl += parseFloat(balances)
    }
  }

  return tvl;
}




module.exports = {
  fetch
}
