const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')
const { fetchURL } = require('../helper/utils')


async function staking(){
    let totalAda = 0
    // Milk locked
    const tvlMilk = (await fetchURL("https://staking.muesliswap.com/milk-locked")).data
    if(tvlMilk.data<=0){
        throw new Error("muesliswap tvl is below 0")
    }
    const infoMilk = (await fetchURL(`https://api.muesliswap.com/price/?base-policy-id=&base-tokenname=&quote-tokenname=4d494c4b&quote-policy-id=8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa`)).data
    const priceMilk = parseFloat(infoMilk.price) / 1e6
    totalAda += priceMilk * tvlMilk

    // Myield locked
    const tvlMyield = parseFloat((await fetchURL("http://staking.muesliswap.com/myield-info")).data[0]["amountStaked"]) / 1e6
    const infoMyield = (await fetchURL(`https://api.muesliswap.com/price/?base-policy-id=&base-tokenname=&quote-tokenname=4d5949454c44&quote-policy-id=8f9c32977d2bacb87836b64f7811e99734c6368373958da20172afba`)).data
    const priceMyield = parseFloat(infoMyield.price)
    totalAda += priceMyield * tvlMyield

    return {
        cardano: totalAda
    }
}


async function adaTvl(){
    const tokens = (await fetchURL("https://orders.muesliswap.com/known-tokens")).data
    let totalAda = 0
    await Promise.all(tokens.map(async t=>{
        const policyId = t.address.split(".")[0];
        const tokenname = t.address.split(".")[1];
        const orders = (await fetchURL(`https://orders.muesliswap.com/orderbook/?policy-id=${policyId}&tokenname=${encodeURIComponent(tokenname)}`)).data
        if(orders.fromToken !== "."){
            throw new Error("Tokens paired against something other than ADA")
        }
        let totalBuy= 0;
        orders.buy.forEach(o=>{
            totalBuy += o.totalPrice
        })
        if(orders.buy.length === 0 || orders.sell.length === 0){
            return
        }
        const topPrice = orders.buy[0].price
        let totalAmountOtherToken = 0
        orders.sell.forEach(o=>{
            totalAmountOtherToken += o.amount
        })
        const totalSell = totalAmountOtherToken * topPrice
        totalAda += totalBuy + totalSell
    }))
    // fetch the prices of each traded token first
    const tokenlistv2 = (await fetchURL("https://api.muesliswap.com/list?base-policy-id=&base-tokenname=")).data
    const adapricev2 = new Map(tokenlistv2.map(d => {
       return [d.price.toToken, parseFloat(d.price.bidPrice)]
    }))
    // then accumulate over the orderbooks
    const orderbooksv2 = (await fetchURL("https://onchain.muesliswap.com/all-orderbooks")).data
    await Promise.all(orderbooksv2.map(async ob=>{
        if(ob.fromToken !== "."){
            const price = adapricev2.get(ob.fromToken)
            let totalAmountOtherToken = 0
            ob.orders.forEach(o=>{
                totalAmountOtherToken += parseInt(o.fromAmount)
            })
            const totalSell = totalAmountOtherToken * price
            if(isNaN(totalSell) || !isFinite(totalSell)) return;
            totalAda += totalSell / 1e6
        }
        else if(ob.fromToken === "."){
            let totalLovelace = 0;
            ob.orders.forEach(o=>{
                totalLovelace += parseInt(o.fromAmount)
            })
            const totalBuy = totalLovelace
            totalAda += totalBuy / 1e6
        }
    }))
    return {
        cardano: totalAda
    }
}

module.exports={
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "The factory addresses are used to find the LP pairs on Smart BCH and Milkomeda. For Cardano we calculate the tokens on resting orders on the order book contracts. TVL is equal to the liquidity on the AMM plus the open orders in the order book",
    smartbch: {
        tvl: getUniTVL({ factory: '0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117', chain: 'smartbch', useDefaultCoreAssets: true }),
        staking: stakingPricedLP("0x4856BB1a11AF5514dAA0B0DC8Ca630671eA9bf56", "0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0", "smartbch", "0x599061437d8455df1f86d401FCC2211baaBC632D", "bitcoin-cash", false, 18)
    },
    cardano:{
        tvl: adaTvl,
        staking
    },
    milkomeda: {
        tvl: getUniTVL({ factory: '0x57A8C24B2B0707478f91D3233A264eD77149D408', chain: 'milkomeda', useDefaultCoreAssets: true }),
    }
}
