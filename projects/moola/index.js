const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetch() {
	let ceur_price = (await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=celo-euro&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))).data["celo-euro"].usd;
	let cusd_price = (await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=celo-dollar&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))).data["celo-dollar"].usd;
	let celo_price = (await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))).data.celo.usd;
	let cusd_pooled = (new BigNumber((await retry(async bail => await axios.get('https://explorer.celo.org/api?module=stats&action=tokensupply&contractaddress=0x64defa3544c695db8c535d289d843a189aa26b98'))).data.result)).div(10**18).toFixed(2);
	let ceur_pooled = (new BigNumber((await retry(async bail => await axios.get('https://explorer.celo.org/api?module=stats&action=tokensupply&contractaddress=0xa8d0e6799ff3fd19c6459bf02689ae09c4d78ba7'))).data.result)).div(10**18).toFixed(2);
	let celo_pooled = (new BigNumber((await retry(async bail => await axios.get('https://explorer.celo.org/api?module=stats&action=tokensupply&contractaddress=0x7037f7296b2fc7908de7b57a89efaa8319f0c500'))).data.result)).div(10**18).toFixed(2);
	return ((ceur_pooled*ceur_price)+(cusd_pooled*cusd_price)+(celo_pooled*celo_price));
}

module.exports = {
  fetch
}