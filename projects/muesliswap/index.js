const { getUniTVL } = require('../helper/unknownTokens')
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

    // old api.muesliswap.com / onchain.muesliswap.com hosts are gone and api-v2 has no all-orderbooks/prices
    // equivalent, so open orders can no longer be valued; only AMM pools are counted
    const pools = (await fetchURL("https://api-v2.muesliswap.com/liquidity/pools?providers=muesliswap-v1,muesliswap-v2,muesliswap-clp&only-verified=n")).data
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
    methodology: "The factory addresses are used to find the LP pairs on Smart BCH and Milkomeda. For Cardano TVL is equal to the liquidity on the MuesliSwap AMM pools",
    cardano: {
        tvl: adaTvl,
        // staking
    },
    milkomeda: {
        tvl: getUniTVL({ factory: '0x57A8C24B2B0707478f91D3233A264eD77149D408', useDefaultCoreAssets: true }),
    }
}
