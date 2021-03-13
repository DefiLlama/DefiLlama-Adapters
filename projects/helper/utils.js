var Web3 = require('web3');
const env = require('dotenv').config()
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));
const abis = require('../config/abis.js').abis
const BigNumber = require("bignumber.js");
const retry = require('async-retry')
const axios = require("axios");

async function returnBalance(token, address) {
  let contract = new web3.eth.Contract(abis.minABI, token);
  let decimals = await contract.methods.decimals().call();
  let balance = await contract.methods.balanceOf(address).call();
  balance = await new BigNumber(balance).div(10 ** decimals).toFixed(2);
  return parseFloat(balance);
}

async function returnDecimals(address) {
  if (address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return 18;
  }
  let contract = new web3.eth.Contract(abis.minABI, address)
  let decimals = await contract.methods.decimals().call();
  return decimals;
}

async function returnEthBalance(address) {

  let getethBalanceRes = await web3.eth.getBalance(address);
  let ethAmount = await new BigNumber(getethBalanceRes).div(10 ** 18).toFixed(2);
  return parseFloat(ethAmount);
}

async function getPrices(object) {
    var stringFetch = '';
    for (var key in object[0]) {
      if (object[0][key] != 'stable') {
        if (stringFetch.length > 0) {
          stringFetch = stringFetch + ',' + object[0][key];
        } else {
          stringFetch = object[0][key];
        }
      }
    }
    return await retry(async bail => await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${stringFetch}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`))
}

async function getPricesFromContract(object) {
  var contractFetch = ''
  for (var key in object) {
    if (object[key]) {
      if (contractFetch.length > 0) {
        contractFetch = contractFetch + ',' + object[key];
      } else {
        contractFetch = object[key];
      }
    }
  }
  return await retry(async bail => await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractFetch}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`))
}

async function getPricesfromString(stringFeed) {
  return await retry(async bail => await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${stringFeed}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`))
}

async function getTokenPrices(object) {
  var stringFetch = '';
  for (var key in object[0]) {
    if (object[0][key] != 'stable') {
      if (stringFetch.length > 0) {
        stringFetch = stringFetch + ',' + object[0][key];
      } else {
        stringFetch = object[0][key];
      }
    }
  }

  return await getTokenPricesFromString(stringFetch);
}

async function getTokenPricesFromString(stringFeed) {
  return result = await retry(async bail => await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${stringFeed}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`));
}

async function returnBlock() {
  return await web3.eth.getBlockNumber()
}

async function fetchURL(url) {
  return await retry(async bail => await axios.get(url))
}


module.exports = {
  fetchURL,
  getPricesfromString,
  getPrices,
  getTokenPricesFromString,
  getTokenPrices,
  returnBalance,
  returnBlock,
  returnDecimals,
  returnEthBalance,
  getPricesFromContract
}
