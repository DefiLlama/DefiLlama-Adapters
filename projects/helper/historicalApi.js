const { toUSDTBalances } = require('./balances')

// getCurrent: ()=>number
// getHistorical: ()=>[{date, totalLiquidityUSD}]
async function getApiTvl(timestamp, getCurrent, getHistorical) {
    if (typeof timestamp === "object" && timestamp.timestamp) timestamp = timestamp.timestamp
    if (Math.abs(timestamp - Date.now() / 1000) < 3600) {
        const tvl = await getCurrent()
        return toUSDTBalances(tvl)
    } else {
        const historical = await getHistorical()
        let closest = historical[0]
        historical.forEach(dayTvl => {
            if (Math.abs(dayTvl.date - timestamp) < Math.abs(closest.date - timestamp)) {
                closest = dayTvl
            }
        })
        if (Math.abs(closest.date - timestamp) > 3600 * 24) { // Oldest data is too recent
            throw new Error("Too old")
        }
        return toUSDTBalances(closest.totalLiquidityUSD)
    }
}

module.exports = {
    getApiTvl
}