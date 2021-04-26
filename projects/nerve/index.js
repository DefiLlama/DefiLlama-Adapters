/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const axios = require("axios");

/*==================================================
  TVL
  ==================================================*/

let balances = {};

async function tvl(timestamp) {

	// use BUSD stable as total sum denomination 
	const address = 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56';
	// CoinGecko API
	const data = await axios.get('https://api.coingecko.com/api/v3/coins/nerve-finance')
  	  .then((response) => {
  		  const tvl = BigNumber(response.data['market_data']['total_value_locked']['usd']);
  		  // return value expects 18 decimals
		  balances[address] = tvl.shiftedBy(18);
  	});

	return balances;
}

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Nerve',   // project name
    website: 'https://nerve.fi/',
    token: 'NRV',             // null, or token symbol if project has a custom token
    category: 'dexes',        // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
    start: 1614556800,        // March 1, 2021 00:00 AM (UTC)
    tvl                       // tvl adapter
  }
