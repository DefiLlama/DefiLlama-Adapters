const { get } = require('../helper/http')

async function tvl(api) {
    const tvlapi = await get('https://defiapi.zyf.ai/api/earnings/tvl/total')
    const data = tvlapi.data.totalTvl
    
    console.log(`Total TVL: ${data} USDC`)
    
    return { 'usd-coin': data }
}

module.exports = {
    methodology: 'Counts the TVL of all smart wallet accounts deployed by ZyFAI protocol',
    sonic: {
        tvl,
    }
}