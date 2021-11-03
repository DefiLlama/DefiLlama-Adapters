const axios = require('axios')

const endpoint = 'https://solana-api.projectserum.com/'

async function getTokenSupply(token) {
    const tokenSupply = await axios.post("https://api.mainnet-beta.solana.com", {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenSupply",
        "params": [token]
    })
    return tokenSupply.data.result.value.uiAmount
}

async function getTokenBalance(token, account) {
    const tokenBalance = await axios.post(endpoint, {
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
    return tokenBalance.data.result.value.reduce((total, account) => total + account.account.data.parsed.info.tokenAmount.uiAmount, 0)
}

async function getTokenAccountBalance(account) {
    const tokenBalance = await axios.post(endpoint, {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountBalance",
        "params": [
            account
        ]
    }, {
        headers: {'Content-Type': 'application/json'}
    })
    return tokenBalance.data.result?.value?.uiAmount
}

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokens(tokensAndAccounts) {
    const tokenlist = await axios.get("https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json").then(r => r.data.tokens)
    const tokenBalances = await Promise.all(tokensAndAccounts.map(t=>getTokenBalance(...t)))
    const balances = {}
    for (let i = 0; i < tokensAndAccounts.length; i++) {
        const token = tokensAndAccounts[i][0]
        let coingeckoId = tokenlist.find(t => t.address === token)?.extensions?.coingeckoId
        const replacementCoingeckoId = tokensAndAccounts[i][2]
        if(coingeckoId === undefined){
            if(replacementCoingeckoId !== undefined){
                coingeckoId = replacementCoingeckoId
            } else {
                throw new Error(`Solana token ${token} has no coingecko id`)
            }
        }
        balances[coingeckoId] = (balances[coingeckoId] || 0) + tokenBalances[i]
    }
    return balances
}

// accountsArray is an array of base58 address strings
async function getMultipleAccountsRaw(accountsArray) {
    if (!Array.isArray(accountsArray) || accountsArray.length === 0 || typeof accountsArray[0] !== "string") {
        throw new Error("Expected accountsArray to be an array of strings")
    }
    const accountsInfo = await axios.post('https://api.mainnet-beta.solana.com', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getMultipleAccounts",
        "params": [accountsArray]
    })
    return accountsInfo.data.result.value
}

// Gets data in Buffers of all addresses, while preserving labels
// Example: labeledAddresses = { descriptiveLabel: "9xDUcgo8S6DdRjvrR6ULQ2zpgqota8ym1a4tvxiv2dH8", ... }
async function getMultipleAccountBuffers(labeledAddresses) {
    let labels = []
    let addresses = []

    for (const [label, address] of Object.entries(labeledAddresses)) {
        labels.push(label)
        addresses.push(address)
    }
    const accountsData = await getMultipleAccountsRaw(addresses)

    const results = {}
    accountsData.forEach((account, index) => {
        if (account === null) {
            results[labels[index]] = null;
        } else {
            results[labels[index]] = Buffer.from(account.data[0], account.data[1]);
        }

        // Uncomment and paste into a hex editor to do some reverse engineering
        // console.log(`${labels[index]}: ${results[labels[index]].toString("hex")}`);
    });

    return results;
}

module.exports = {
    getTokenSupply,
    getTokenBalance,
    getTokenAccountBalance,
    sumTokens,
    getMultipleAccountsRaw,
    getMultipleAccountBuffers
}