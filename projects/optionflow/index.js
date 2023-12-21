const { fetchURL } = require('../helper/utils')


async function adaTvl() {
    let totalAda = 0

    // fetch the prices of each traded token first
    const adaPrices = new Map(Object.entries((await fetchURL("https://api.muesliswap.com/defillama/prices")).data))

    // then accumulate over the orderbooks
    const orderbookV2 = (await fetchURL("https://api.optionflow.finance/all-orderbooks")).data
    const vOrderbookV2 = orderbookV2
        .map(ob => {
            if (ob.fromToken === ".") {
                const totalBuy = ob.orders
                    .map(o => parseInt(o.fromAmount)).reduce((p, c) => p + c, 0)
                return totalBuy
            } else {
                const price = adaPrices.get(ob.fromToken)?.bidPrice ?? 0
                const totalAmountOtherToken = ob.orders
                    .map(o => parseInt(o.fromAmount)).reduce((p, c) => p + c, 0)
                const totalSell = totalAmountOtherToken * price
                return totalSell
            }
        })
    totalAda += vOrderbookV2.reduce((p, c) => p + c, 0) / 1e6

    // and add minted TVLs
    const tvlMinted = (await fetchURL("https://api.optionflow.finance/locked-option-value")).data
    totalAda += tvlMinted / 1e6

    return {
        cardano: totalAda
    }
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "We calculate the tokens on resting orders on the order book contracts. TVL is equal to the liquidity in the option contract plus the resting orders in the order book",
    cardano: {
        tvl: adaTvl,
    },
}
