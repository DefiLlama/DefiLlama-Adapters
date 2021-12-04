const axios = require('axios')

const endpoint = 'https://mango-stats-v3.herokuapp.com/spot?mangoGroup=mainnet.1'

// Very inefficient
function findClosestToDate(values, date) {
    let min = values[0];
    for (const val of values) {
        const valDate = new Date(val.time).getTime()
        const minDate = new Date(min.time).getTime()
        if (Math.abs(valDate - date) < Math.abs(minDate - date)) {
            min = val
        }
    }
    if(Math.abs(new Date(min.time).getTime()-date) > 24*3600*1000){
        return {
            totalDeposits: 0,
            totalBorrows: 0
        }
    }
    return min
}

const coingeckoIds = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'SOL': 'solana',
    'SRM': 'serum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'MNGO': 'mango-markets',
    'RAY': 'raydium',
    'COPE': 'cope',
    'STEP': 'step-finance'
}


async function tvl(timestamp) {
    const balances = {};
    const stats = await axios.get(endpoint)
    const date = new Date(timestamp * 1000).getTime()
    Object.entries(coingeckoIds).map(([mangoId, coingeckoId]) => {
        const assetDeposits = stats.data.filter(s => s.name === mangoId)
        if (assetDeposits.length > 0) {
            const closestVal = findClosestToDate(assetDeposits, date)
            balances[coingeckoId] = closestVal.totalDeposits - closestVal.totalBorrows
        }
    })
    return balances
}

async function test() {
    console.log(await tvl(Date.now()/1000));
}
// test();

module.exports = {
    timetravel: false,
    solana: {
        tvl,
    },
    tvl
}
