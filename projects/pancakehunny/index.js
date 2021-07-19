const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
	let response = await retry(async bail => await axios.get('https://api.pancakehunny.finance'));

	const data = response.data.data;
	let tvl = new BigNumber(0);

	for (let i = 0; i < data.length; i++) {
		tvl = tvl.plus(new BigNumber(data[i].tvl));
	}

	return toUSDTBalances(tvl.dividedBy(new BigNumber(10).pow(18)));
}

module.exports = {
	tvl
}
