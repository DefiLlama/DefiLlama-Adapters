const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')
const { fetchURL } = require('../helper/utils')


async function staking(){
    const tvl = await fetchURL("https://staking.muesliswap.com/milk-locked")
    if(tvl.data<=0){
        throw new Error("muesliswap tvl is below 0")
    }
    const orders = (await fetchURL(`https://orders.muesliswap.com/orderbook/?policy-id=8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa&tokenname=MILK`)).data
    if(orders.fromToken !== "."){
        throw new Error("Tokens paired against something other than ADA")
    }
    const topPrice = orders.buy[0].price
    return {
        cardano: tvl.data * topPrice
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
    const orderbooksv2 = (await fetchURL("https://pools.muesliswap.com/all-orderbooks")).data
    await Promise.all(orderbooksv2.map(async orders=>{
        if(orders.fromToken !== "."){
            throw new Error("Tokens paired against something other than ADA")
        }
        let totalBuy= 0;
        orders.buy.forEach(o=>{
            totalBuy += (o.totalLvl / 1e6)
        })
        if(orders.buy.length === 0 || orders.sell.length === 0){
            return
        }
        const topPrice = (orders.buy[0].lvlPerToken / 1e6)
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
    methodology: "The factory addresses are used to find the LP pairs on Smart BCH and Milkomeda. For Cardano we calculate the tokens on resting orders on the order book contracts. TVL is equal to the liquidity on the AMM plus the open orders in the order book",
    smartbch: {
        tvl:calculateUsdUniTvl("0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0"], "bitcoin-cash"),
        staking: stakingPricedLP("0x4856BB1a11AF5514dAA0B0DC8Ca630671eA9bf56", "0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0", "smartbch", "0x599061437d8455df1f86d401FCC2211baaBC632D", "bitcoin-cash", false, 18)
    },
    cardano:{
        tvl: adaTvl,
        staking
    },
    milkomeda: {
        tvl: calculateUsdUniTvl(
            '0x57A8C24B2B0707478f91D3233A264eD77149D408',
            'milkomeda',
            '0xAE83571000aF4499798d1e3b0fA0070EB3A3E3F9',
            [
                '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844', //TETHER
                '0xb44a9b6905af7c801311e8f4e76932ee959c663c', //USDC
                '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', //ETH
                '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c', //ceETH
                '0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A', //AVAX
                '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8', //BTC
                '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52', //BNB
            ],
            'cardano'
        )
    }
}
