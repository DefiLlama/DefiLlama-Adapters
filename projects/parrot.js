const axios = require('axios')

"DGi3TxcKUq3E5t1mL33n9jRgdWWKngeRkP3fUppG4inn"

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

async function tvl() {
    const [usdcAmount, usdtAmount] = await Promise.all([
        getTokenBalance("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "DefDiDiauGqS8ZUiHHuRCpmt8XZPGTTp6DY7UQP5NkkP"),
        getTokenBalance("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "DGi3TxcKUq3E5t1mL33n9jRgdWWKngeRkP3fUppG4inn"),
    ])
    return {
        'usd-coin': usdcAmount,
        'tether': usdtAmount
    }
}

module.exports = {
    tvl
}