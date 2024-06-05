const { getExports } = require('../helper/heroku-api')

function getPolkadexExports() {
	let tvl = getExports("polkadex", ['polkadex']);
	if(tvl.polkadex.staking === undefined) {
		let staking = getExports("polkadex-staking", ['polkadex']);
		tvl.polkadex.staking = staking.polkadex.tvl;
	}
	return tvl;
}

module.exports = {
	timetravel: false,
	...getPolkadexExports(),
}