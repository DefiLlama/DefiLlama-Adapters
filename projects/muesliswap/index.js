const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { fetchURL } = require('../helper/utils')

async function adaTvl(){
    const tokens = (await fetchURL("https://orders.muesliswap.com/tokens-info")).data
    let totalAda = 0
    await Promise.all(tokens.map(async t=>{
        const orders = (await fetchURL(`https://orders.muesliswap.com/orderbook/?policy-id=${t.policyId}&tokenname=${t.name}`)).data
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
    return {
        cardano: totalAda
    }
}

module.exports={
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "Factory address (0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    smartbch: {
        tvl:calculateUsdUniTvl("0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0"], "bitcoin-cash")
    },
    cardano:{
        tvl: adaTvl
    }
}