/*
 * Ostable is an advanced stable coin platform powered by bonding curves. It consists of a collection of autonomous agents
 * (protocols):
 * - curves: 3 dimensional bonding curves that lock in GBYTEs as reserve and issue interest and growth tokens
 * - deposits: that issue stable coins in exchange for interest tokens
 * - stability funds: hold growth tokens (v2 only) and algorithmically manage the curve to keep the peg,
 *      investors contribute GBYTEs to their reserves by buying stability fund shares
 * - governance: investors lock in stability fund shares to adjust various parameters
 *
 * This project calculates TVL of the Ostable curve autonomous agents.
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
async function curveTvl(timestamp) {
    const [assetMetadata, exchangeRates, ...baseAABalances] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD(),
        fetchBaseAABalances(timestamp, "FCFYMFIOGS363RLDLEWIDBIIBU7M7BHP"), // curve v1
        fetchBaseAABalances(timestamp, "3RNNDX57C36E76JLG2KAQSIASAYVGAYG"), // curve v1
        fetchBaseAABalances(timestamp, "3DGWRKKWWSC6SV4ZQDWEHYFRYB4TGPKX"), // curve v2
        fetchBaseAABalances(timestamp, "CD5DNSVS6ENG5UYILRPJPHAB3YXKA63W"), // curve v2
        fetchBaseAABalances(timestamp, "GWQVOQDPT4L5XPMDIQF5MNDQZNV5VGLY"), // curve v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

module.exports = {
    timetravel: false,
    doublecounted: false,
    methodology:
        "The TVL is the USD value of the total native asset (GBYTE) locked into the autonomous agents that extend the Ostable curve protocol (v1 and v2).",
    obyte: {
        fetch: curveTvl
    },
    fetch: curveTvl
}
