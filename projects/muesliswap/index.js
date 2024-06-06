const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')
const { fetchURL } = require('../helper/utils')


async function staking() {
    let totalAda = 0
    // Milk locked
    const tvlMilk = (
        (await fetchURL("https://staking.muesliswap.com/milk-locked")).data +
        (await fetchURL("https://staking.muesliswap.com/milk-vault-locked")).data
    )
    if (tvlMilk.data <= 0) {
        throw new Error("muesliswap tvl is below 0")
    }
    const infoMilk = (await fetchURL(`https://api.muesliswap.com/price/?base-policy-id=&base-tokenname=&quote-tokenname=4d494c4b&quote-policy-id=8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa`)).data
    const priceMilk = parseFloat(infoMilk.price)
    totalAda += priceMilk * tvlMilk / 1e6

    // Myield locked
    const tvlMyield = parseFloat((await fetchURL("http://staking.muesliswap.com/myield-info")).data[0]["amountStaked"]) / 1e6
    const infoMyield = (await fetchURL(`https://api.muesliswap.com/price/?base-policy-id=&base-tokenname=&quote-tokenname=4d5949454c44&quote-policy-id=8f9c32977d2bacb87836b64f7811e99734c6368373958da20172afba`)).data
    const priceMyield = parseFloat(infoMyield.price)
    totalAda += priceMyield * tvlMyield / 1e6

    return {
        cardano: totalAda
    }
}


async function adaTvl() {
    let totalAda = 0

    // fetch the prices of each traded token first
    const adaPrices = new Map(Object.entries((await fetchURL("https://api.muesliswap.com/defillama/prices")).data))

   /*  // then first accumulate over the legacy orderbook
    const orderbookV1 = (await fetchURL("https://orders.muesliswap.com/all-orderbooks")).data
    const vOrderbookV1 = orderbookV1.map(ob => {
        if (ob.fromToken === ".") {
            const totalBuy = ob.buy.map(o => parseFloat(o.totalPrice)).reduce((p, c) => p + c, 0)
            const totalSell = ob.sell.map(o => parseFloat(o.amount)).reduce((p, c) => p + c, 0)
            // Find the price (we need to convert the tokenname to hex first for this)
            const policyId = ob.toToken.split('.')[0]
            const name = Buffer.from(ob.toToken.split('.', 2)[1]).toString('hex').toLowerCase()
            const price = (adaPrices.get(policyId + '.' + name)?.bidPrice ?? 0) / 1e6
            return (totalBuy + totalSell * price)
        } else {
            const totalBuy = ob.buy.map(o => parseFloat(o.totalPrice)).reduce((p, c) => p + c, 0)
            const totalSell = ob.sell.map(o => parseFloat(o.amount)).reduce((p, c) => p + c, 0)
            // Find the price (we need to convert the tokenname to hex first for this)
            const fromPolicyId = ob.fromToken.split('.')[0]
            const fromName = Buffer.from(ob.fromToken.split('.', 2)[1]).toString('hex').toLowerCase()
            const fromPrice = (adaPrices.get(fromPolicyId + '.' + fromName)?.bidPrice ?? 0) / 1e6
            const toPolicyId = ob.toToken.split('.')[0]
            const toName = Buffer.from(ob.toToken.split('.', 2)[1]).toString('hex').toLowerCase()
            const toPrice = (adaPrices.get(toPolicyId + '.' + toName)?.bidPrice ?? 0) / 1e6
            return (totalBuy * fromPrice + totalSell * toPrice)
        }
    })
    totalAda += vOrderbookV1.reduce((p, c) => p + c, 0) */

    // then accumulate over the orderbooks
    const orderbookV2 = (await fetchURL("https://onchain.muesliswap.com/all-orderbooks")).data
    const vOrderbookV2 = orderbookV2
        .map(ob => {
            if (ob.fromToken === ".") {
                const totalBuy = ob.orders
                    .filter(o => !o.providers.includes("muesliswapAMM"))
                    .map(o => parseInt(o.fromAmount)).reduce((p, c) => p + c, 0)
                return totalBuy
            } else {
                const price = adaPrices.get(ob.fromToken)?.bidPrice ?? 0
                const totalAmountOtherToken = ob.orders
                    .filter(o => !o.providers.includes("muesliswapAMM"))
                    .map(o => parseInt(o.fromAmount)).reduce((p, c) => p + c, 0)
                const totalSell = totalAmountOtherToken * price
                return totalSell
            }
        })
    totalAda += vOrderbookV2.reduce((p, c) => p + c, 0) / 1e6

    // and add pool TVLs
    const pools = (await fetchURL("https://api.muesliswap.com/liquidity/pools?providers=muesliswap,muesliswap_clp,muesliswap_v2&only-verified=n")).data
    const vPools = pools.map(p => {
        const amountA = parseInt(p.tokenA.amount) * parseFloat(p.tokenA.priceAda)
        const amountB = parseInt(p.tokenB.amount) * parseFloat(p.tokenB.priceAda)
        return amountA + amountB
    })
    totalAda += vPools.reduce((p, c) => p + c, 0) / 1e6

    return {
        cardano: totalAda
    }
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "The factory addresses are used to find the LP pairs on Smart BCH and Milkomeda. For Cardano we calculate the tokens on resting orders on the order book contracts. TVL is equal to the liquidity on the AMM plus the open orders in the order book",
    cardano: {
        tvl: adaTvl,
        // staking
    },
    milkomeda: {
        tvl: getUniTVL({ factory: '0x57A8C24B2B0707478f91D3233A264eD77149D408', useDefaultCoreAssets: true }),
    }
}
