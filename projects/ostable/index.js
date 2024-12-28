/*
 * Ostable is an advanced stable coin platform powered by bonding curves. It is a collection of autonomous agents
 * that interact with each other to offer various financial products to investors such as interest coins, stable coins
 * and stability fund shares.
 *
 * @see https://ostable.org/
 */
const {
    fetchBaseAABalances,
    fetchOstableExchangeRatesInUSD,
    fetchOstableAssets,
    summingBaseAABalancesToTvl,
} = require('../helper/chain/obyte')

/**
 * Bonding curve autonomous agents that lock in GBYTEs as reserve and issue interest tokens and growth tokens.
 */
async function curveTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "FCFYMFIOGS363RLDLEWIDBIIBU7M7BHP"), // curve v1
        fetchBaseAABalances(timestamp, "3RNNDX57C36E76JLG2KAQSIASAYVGAYG"), // curve v1
        fetchBaseAABalances(timestamp, "3DGWRKKWWSC6SV4ZQDWEHYFRYB4TGPKX"), // curve v2
        fetchBaseAABalances(timestamp, "CD5DNSVS6ENG5UYILRPJPHAB3YXKA63W"), // curve v2
        fetchBaseAABalances(timestamp, "GWQVOQDPT4L5XPMDIQF5MNDQZNV5VGLY"), // curve v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

/**
 * Deposit autonomous agents where investors deposit interest tokens and receive stable coins in exchange.
 */
async function depositTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "GEZGVY4T3LK6N4NJAKNHNQIVAI5OYHPC"), // deposit v1
        fetchBaseAABalances(timestamp, "YXPLX6Q3HBBSH2K5HLYM45W7P7HFSEIN"), // stable v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

/**
 * Stability Fund autonomous agents that hold growth tokens (v2 only) and interest tokens to algorithmically manage
 * the curve to keep the peg. Investors contribute GBYTEs to their reserves by buying stability fund shares issued
 * by the fund.
 */
async function stabilityFundTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "5WOTEURNL2XGGKD2FGM5HEES4NKVCBCR"), // stability fund
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

/**
 * Governance autonomous agents are used by investors to lock in stability fund shares to adjust various parameters.
 */
async function governanceTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "Y4VBXMROK5BWBKSYYAMUW7QUEZFXYBCF"), // governance v1
        fetchBaseAABalances(timestamp, "UUPBIWDWQ7Q4WXS5CWSEKUQE34FG6L55"), // governance v1
        fetchBaseAABalances(timestamp, "JL6OOEOQCJ2RJ3NHCUJLUBDR3ZE3GY3F"), // governance v2
        fetchBaseAABalances(timestamp, "LXHUYEV6IHBCTGMFNSWRBBU7DGR3JTIY"), // governance v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

// insignificant balance
async function decisionEngine(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "625UKTER5WR5JQPQYS7CU4ST2EXFUCDG"), // decision engine v2
        fetchBaseAABalances(timestamp, "R3WZUWKTFISJ53MGAGSS5OIVMDAFC3WV"), // decision engine v2
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

async function totalTvl(timestamp) {
    const [assetMetadata, exchangeRates] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD()
    ])

    const tvls = await Promise.all([
        curveTvl(timestamp, assetMetadata, exchangeRates),
        depositTvl(timestamp, assetMetadata, exchangeRates),
        governanceTvl(timestamp, assetMetadata, exchangeRates),
        stabilityFundTvl(timestamp, assetMetadata, exchangeRates),
        decisionEngine(timestamp, assetMetadata, exchangeRates)
    ])

    return {
      tether: tvls.reduce( (total, tvl) => total + tvl, 0)
    }
}

module.exports = {
    timetravel: false,
        misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that extend the Ostable protocol (v1, v2).",
    obyte: {
        tvl: totalTvl
    }
}
