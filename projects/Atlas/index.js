const {
	fetchURL
} = require('../helper/utils')


async function tvl() {
	const res = await fetchURL('https://atlasfi.org/market.php?action=read&key=totalLockedAmount')
	return {
		'usd': res.data
	}
}

module.exports = {
	timetravel: false,
	methodology: 'Sums the total value locked of all strategies in Atlas',
	arbitrum: {
		tvl,
	}
}
