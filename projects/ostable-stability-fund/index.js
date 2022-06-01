/*
 * Ostable is an advanced stable coin platform powered by bonding curves. It consists of a collection of autonomous agents
 * (protocols):
 * - curves: 3 dimensional bonding curves that lock in GBYTEs as reserve and issue interest and growth tokens
 * - deposits: that issue stable coins in exchange for interest tokens
 * - stability funds: hold growth tokens (v2 only) and algorithmically manage the curve to keep the peg,
 *      investors contribute GBYTEs to their reserves by buying stability fund shares
 * - governance: investors lock in stability fund shares to adjust various parameters
 *
 * This project calculates TVL of the Ostable stability fund autonomous agents.
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
async function stabilityFundTvl(timestamp) {
    const [assetMetadata, exchangeRates, ...baseAABalances] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD(),
        fetchBaseAABalances(timestamp, "5WOTEURNL2XGGKD2FGM5HEES4NKVCBCR"), // stability fund
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

module.exports = {
    timetravel: false,
    doublecounted: false, // partially double counted
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that extend the Ostable Stability Fund protocol. " +
        "The locked in assets are a mix of the growth and interest tokens issued by the Ostable Curve protocol plus the native " +
        "asset (GBYTE) contributed by investors.",
    obyte: {
        fetch: stabilityFundTvl
    },
    fetch: stabilityFundTvl
}
