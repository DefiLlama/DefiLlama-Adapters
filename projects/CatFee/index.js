const {
	fetchURL
} = require('../helper/utils');

async function getCurrentStake() {
	let result = await fetchURL('https://catfee.io/api/stake/public/project/stat'); 
	let trx = parseInt(result.data.data.total_staked_amount_sun);
	return trx;
}

async function tvl() {
	return {
		"tron": await getCurrentStake()
	}
}

module.exports = {
	tron: {
		tvl,
	},
}
