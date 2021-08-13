const {getPools} = require('./pools')
const axios = require('axios')

async function getTokenBalance(account){
    const tokenBalance = await axios.post('https://solana-api.projectserum.com/', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountBalance",
        "params": [
            account
        ]
    })
    return tokenBalance.data.result?.value?.uiAmount
}

async function tvl(){
    const pools = getPools()
    const balances = {}
    const tokenlist = (await axios.get("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json")).data.tokens

    for(const pool of pools){
        const tokenBalances = await Promise.all(pool.holdingAccounts.map(getTokenBalance))
        const coingeckoIds = pool.holdingMints.map(mint=>tokenlist.find(t=>t.address === mint)?.extensions?.coingeckoId)
        for(let i=0; i<2; i++){
            const coingeckoId = coingeckoIds[i]
            const balance = tokenBalances[i]
            if(coingeckoId !== undefined && balance !== undefined){
                balances[coingeckoId] = (balances[coingeckoId] || 0) + balance
            }
        }
    }
    return balances
}

module.exports = {
    timetravel: true,
    tvl
}
