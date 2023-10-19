const utils = require('../helper/utils')
const { getApiTvl } = require('../helper/historicalApi')
const api = 'https://etl-cl.nolus.network:8080/api'

function tvl(timestamp) {
	return getApiTvl(timestamp,
		async () => {
			const resp = await utils.fetchURL(`${api}/total-value-locked`)
			return resp.data.total_value_locked
		},
		async () => {
			const resp = await utils.fetchURL(`${api}/total-value-locked-series`)
			return resp.data.map(v => ({
				date: new Date(v.timestamp).getTime(),
				totalLiquidityUSD: v.tvl
			}))
		})
}

module.exports = {
	methodology: "The combined total of lending pool assets and the current market value of active leases",
	nolus: {
		tvl
	}
}

// node test.js projects/nolus/index.js
