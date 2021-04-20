const axios = require('axios')

const endpoint = "https://api.orca.so/allPools"
const translatedCoingeckoIds = {
    'BTC': 'bitcoin',
    'SOL': 'solana',
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'RAY': 'raydium',
    'SRM': 'serum',
    'ROPE': 'rope-token',
    'KIN': 'kin',
    'FTT': 'ftx-token',
    'USDT-SRM': 'tether'
}

const decimals = {
    'ROPE': 9,
    'SOL': 9
}

function addToBalance(balances, token, value){
    const geckoId = translatedCoingeckoIds[token]
    balances[geckoId] = (balances[geckoId] || 0) + Number(value)/(10**(decimals[token] || 6))
}

async function tvl(){
    const balances = {}

    const pools = await axios.get(endpoint);
    Object.values(pools.data).forEach(pool=>{
        const [tokenA, tokenB] = pool.poolId.split('/')
        addToBalance(balances, tokenA, pool.tokenAAmount)
        addToBalance(balances, tokenB, pool.tokenBAmount)
    })
    console.log(balances)

    return balances
}

module.exports = {
    tvl
  }
  