const axios = require('axios')

async function fetch(){
    const result = await axios.get("https://api.annex.finance/api/v1/governance/annex")
    return result.data.data.markets.reduce((total, market)=>total+Number(market.liquidity), 0)
}

module.exports={
    fetch
}