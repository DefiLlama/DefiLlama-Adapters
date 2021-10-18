const retry = require('./helper/retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");


// Get supply for token (from xdai or mainnet)
async function getSupply(token, contractChain) {
  let contract = token[contractChain];
  if (contract === null) {
    return new BigNumber(0);
  }
  // URL from scanner depends on contract chain
  let url;
  if (contractChain === 'ethereumContract') {
    url = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + contract + '&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82';
  }
  else if (contractChain === 'xDaiContract') {
    url = 'https://blockscout.com/xdai/mainnet/api?module=stats&action=tokensupply&contractaddress=' + contract;
  }
  // Once URL built, parse response with 18 decimals
  let response = await retry(async bail => await axios.get(url));
  let supply = new BigNumber(response.data.result).div(10 ** 18);
  return supply;
}

// Loop through all RealT tokens listed by realt.community API and accumulate tokenprice * supply, where supply is biggest of xdai or mainnet
// See https://api.realt.community/ for reference
async function xdaiTvl() {
  let realt_tokens = await retry(async bail => await axios.get('https://api.realt.community/v1/token'));
  realt_tokens = realt_tokens.data;

  // Filter out deprecated contracts
  realt_tokens = realt_tokens.filter(t => !t['fullName'].startsWith('OLD-'));
  realt_tokens = realt_tokens.slice(0,5);
  // .filter(t => t['xDaiContract'] !== null).slice(0,5)

  var tvl = new BigNumber(0);
  for (let token of realt_tokens) { 
    // Retrieve mainnet and xdai supplies of tokens
    let mainnetSupply = await getSupply(token, 'ethereumContract');
    let xdaiSupply = await getSupply(token, 'xDaiContract');
    let largestSupply = mainnetSupply.isGreaterThan(xdaiSupply) ? mainnetSupply : xdaiSupply;

    // Multiply by token price as given by price feed from realt community to get property price
    console.log(largestSupply);
    let propertyPrice = largestSupply.times(token['tokenPrice']);
    tvl = tvl.plus(propertyPrice);

    // Logs
    console.log(token['fullName'], ' - propertyPrice:', propertyPrice.toFixed(2), ' - TOKEN PRICE:', token['currency'], token['tokenPrice'], ' - LargestSupply:', largestSupply.toFixed(2));

  }
  return tvl;
}

module.exports = {
  xdaiTvl,
  methodology: `TVL for RealT consists of the accumulation of all properties prices, each being tokenPrice * tokenSupply`, 
  xdai: {
      tvl: xdaiTvl
  },
  tvl: sdk.util.sumChainTvls([xdaiTvl])
}


/*
A token looks like below as returned by community API
{
  fullName	"19191 Bradford Ave, Detroit, MI 48205"
  shortName	"19191 Bradford"
  symbol	"REALTOKEN-S-19191-BRADFORD-AVE-DETROIT-MI"
  tokenPrice	54.04
  currency	"USD"
  ethereumContract	"0x584967356bad1499c10a8695522983F2fB7d88F3"
  xDaiContract	"0x584967356bad1499c10a8695522983F2fB7d88F3"
  lastUpdate	
  date	"2021-10-17 20:00:01.000000"
  timezone_type	3
  timezone	"UTC"
}
*/
