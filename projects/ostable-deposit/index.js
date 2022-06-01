/*
 * Ostable is an advanced stable coin platform powered by bonding curves. It consists of a collection of autonomous agents
 * (protocols):
 * - curves: 3 dimensional bonding curves that lock in GBYTEs as reserve and issue interest and growth tokens
 * - deposits: that issue stable coins in exchange for interest tokens
 * - stability funds: hold growth tokens (v2 only) and algorithmically manage the curve to keep the peg,
 *      investors contribute GBYTEs to their reserves by buying stability fund shares
 * - governance: investors lock in stability fund shares to adjust various parameters
 *
 * This project calculates TVL of the Ostable deposit autonomous agents.
 *
 * @see https://ostable.io/
 */

const {
    fetchBaseAABalances,
    fetchOstableExchangeRatesInUSD,
    fetchOstableAssets,
    summingBaseAABalancesToTvl
} = require('../helper/obyte')

// TODO support time travel for asset list and exchange rates
async function depositTvl(timestamp) {
    const [assetMetadata, exchangeRates, ...baseAABalances] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD(),
        fetchBaseAABalances(timestamp, "GEZGVY4T3LK6N4NJAKNHNQIVAI5OYHPC"), // deposit v1
        fetchBaseAABalances(timestamp, "YXPLX6Q3HBBSH2K5HLYM45W7P7HFSEIN"), // stable v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

module.exports = {
    timetravel: false,
    doublecounted: true,
    methodology:
        "The TVL is the USD value of the total Ostable Curve issued interest tokens locked into the autonomous agents that extend the Ostable Deposit protocol (v1 and v2).",
    obyte: {
        fetch: depositTvl
    },
    fetch: depositTvl
}
