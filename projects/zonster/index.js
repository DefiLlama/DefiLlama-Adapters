const {BigNumber} = require("bignumber.js");
const axios = require('axios');

async function fetch() {
	let total = new BigNumber(0);
	try {
		const { data } = await axios.get('https://data.zonster.cool');
		if (data && data['farms'] && data['farms']['tvl']) {
			for (let [, value] of Object.entries(data['farms']['tvl'])) {
				total = total.plus(new BigNumber(value.toString()));
			}
		}
	} catch (e) {}

	return total.toFixed(2);
}

module.exports = {
	fantom:{
		fetch,
	},
	fetch
}
