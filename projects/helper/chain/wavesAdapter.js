const { getApiTvl } = require('../historicalApi')
const { fetchURL } = require('../utils')

const MINUTE = 60 * 1000
const host = 'https://tvl.waves.tech/api/v1/history'

function wavesAdapter(uri, calcTvl) {
    const endpoint = host + uri
    return async (time) => {
        return getApiTvl(time, async () => {
            const data = (await fetchURL(`${endpoint}?limit=1000&since=${time * 1e3 - 10 * MINUTE}`)).data
            const last = data[data.length - 1]
            return calcTvl(last)
        }, async () => {
            const data = (await fetchURL(`${endpoint}?limit=1000&since=${time * 1e3 - 6 * 60 * MINUTE}`)).data
            return data.map(item => ({
                date: item.createdAt / 1e3,
                totalLiquidityUSD: calcTvl(item)
            }))
        })
    }
}

function wavesExport(uri, calcTvl = item => item.totalLocked) {
    return {
        misrepresentedTokens: true,
        timetravel: false,
        waves: { tvl: wavesAdapter(uri, calcTvl) }
    }
}

module.exports = {
    wavesAdapter, wavesExport,
}