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
    return tokenBalance.data.result.value[0].account.data.parsed.info.tokenAmount.uiAmount
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

module.exports = {
    getTokenBalance,
    getTokenAccountBalance
}