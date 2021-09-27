const {fetchURL} = require('./helper/utils')

const endpoint = "https://rocketswap.exchange:2053/api/get_market_summaries_w_token"

async function tvl(){
    const markets = await fetchURL(endpoint)
    let tvl = 0;
    markets.data.forEach(market=>{
        tvl += Number(market.reserves[0])*2
    })
    return {
        'lamden': tvl
    }
}

module.exports={
    tvl
}