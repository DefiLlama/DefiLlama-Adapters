/*
 * Counterstake is a permissionless and fully decentralized cross-chain bridge.
 *
 * @see https://counterstake.org/
 */
const {
    fetchBaseAABalances,
    fetchOstableAssets,
    fetchOstableExchangeRatesInUSD,
    fetchOswapAssets,
    fetchOswapExchangeRates,
    summingBaseAABalancesToTvl,
} = require('../helper/chain/obyte')


async function bridgeTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "DAN6VZNKNZBKJP7GYJST5FMONZOY4FNT"), // export
        fetchBaseAABalances(timestamp, "HNAFSLWSZDU2B2PLFIUNRZLGS4F2AUIL"), // import
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

async function pooledAssistantTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "WKGC4O5UPW37XEGQKXPINIXFAXHTYHKL"), // export assitant
        fetchBaseAABalances(timestamp, "HLSRAK6LGDXLNGXUCB5Z43NCZMVLYTJU"), // import assistant
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

async function governanceTvl(timestamp, assetMetadata, exchangeRates) {
    const baseAABalances = await Promise.all([
        fetchBaseAABalances(timestamp, "HLNWXGGHGXWMZN27W2722MNJCHH2IVAO"), // export governance
        fetchBaseAABalances(timestamp, "KDHCTQOTKTO6MLYOCU6OCBI7KK72DV3P"), // import governance
        fetchBaseAABalances(timestamp, "VIKQXIULRJF7WATTAID2BB6YD6FRMZCF"), // pooled assistant governance
    ])

    return baseAABalances.reduce(summingBaseAABalancesToTvl(assetMetadata, exchangeRates), 0)
}

/**
 * Calculates TVL on the Obyte side of the cross-chain bridge. The calculated TVL contains:
 *  - the temporary stakes held in GBYTE for cross-chain transfers,
 *  - exported Obyte assets such as GBYTE or OUSD that are held in custody by the bridge
 *  - imported foreign chain assets (the Obyte version of those) held in pooled assistants as a buffer for faster transfers
 */
async function totalObyteTvl(timestamp) {
    // Fetch Ostable assets because it makes sense to export those Obyte assets to other chains
    // Fetch Oswap assets because pooled import assistants hold imported foreign assets to speed up user transfers form foreign chains
    const [ostableAssetMetadata, ostableExchangeRates, oswapAssetMetadata, oswapExchangeRates] = await Promise.all([
        fetchOstableAssets(),
        fetchOstableExchangeRatesInUSD(),
        fetchOswapAssets(),
        fetchOswapExchangeRates()
    ])

    const assetMetadata = { ...oswapAssetMetadata, ...ostableAssetMetadata }
    const exchangeRates = { ...oswapExchangeRates, ...ostableExchangeRates }

    const tvls = await Promise.all([
        bridgeTvl(timestamp, assetMetadata, exchangeRates),
        pooledAssistantTvl(timestamp, assetMetadata, exchangeRates),
        governanceTvl(timestamp, assetMetadata, exchangeRates)
    ])

    return {
      tether: tvls.reduce( (total, tvl) => total + tvl, 0)
    }
}

// TODO add Ethereum, Polygon, BSC side of TVL
module.exports = {
    timetravel: false,
    doublecounted: false,
    misrepresentedTokens: true,
    methodology:
        "The TVL is the USD value of the assets locked into the autonomous agents that extend the Counterstake protocol. " +
        "This includes the value of exported assets held in the custody of cross-chain bridges, the stakes of cross-chain transfers, " +
        "pooled assistant buffers and value stored for governance.",
    obyte: {
        tvl: totalObyteTvl
    }
}
