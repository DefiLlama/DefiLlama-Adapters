const axios = require('axios')

async function getTokenBalance(token, account) {
    const tokenBalance = await axios.post("https://api.mainnet-beta.solana.com", {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [
            account,
            {
                "mint": token
            },
            {
                "encoding": "jsonParsed"
            }
        ]
    })
    return tokenBalance.data.result.value.reduce((total, account)=>total+account.account.data.parsed.info.tokenAmount.uiAmount, 0)
}

async function getTokenAccountBalance(account){
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

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokens(tokensAndAccounts){
    const tokenlist = axios.get("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json").then(r=>r.data.tokens)
    const tokenBalances = await Promise.all(tokensAndAccounts.map(getTokenBalance))
    const balances = {}
    for(let i=0; i<tokensAndAccounts.length; i++){
        const token = tokensAndAccounts[i][0]
        const coingeckoId = tokenlist.find(t=>t.address === token)?.extensions?.coingeckoId
        balances[coingeckoId] = tokenBalances[i]
    }
    return balances
}

module.exports = {
    getTokenBalance,
    getTokenAccountBalance,
    sumTokens
}