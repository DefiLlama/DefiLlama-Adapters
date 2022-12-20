const sdk = require('@defillama/sdk')
const { getTokenBalance } = require('../helper/chain/tron')

const tokens = {
    USDT: { 'address': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'id': 'USDT' },
    BTC: { 'address': 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 'id': 'BTC' },
    ETH: { 'address': 'THb4CqiFdwNHsWsQCs4JhzwjMWys4aqCbF', 'id': 'ETH' },
    LTC: { 'address': 'TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd', 'id': 'LTC' },
    DOGE: { 'address': 'THbVQp8kMjStKNnf2iCY6NEzThKMK5aBHg', 'id': 'DOGE' },
    RSF: { 'address': 'TNEjtKFHWpz8bN2ZruLVY2NW2AD39uSUAs', 'id': 'RSF' },
}

const contracts = [
    [tokens.BTC, 'TVMuhpXdRvNjjFAWqZ5urvhrQQyFvc19SN'],
    [tokens.USDT, 'TJmx4Zg4xMjCZR5Q3aoCyDmYY3r42xU2GZ'],
    [tokens.ETH, 'TMiHbWfnzh8cFmxNptoDgBvhuFSe2eiDFQ'],
    [tokens.USDT, 'TVR8KWCV21nAM6Epifzh73Y9wy8GFzKdBP'],
    [tokens.LTC, 'TWxrUkHSSHwJoNtLPJimVmgKhmwVGvhwUZ'],
    [tokens.USDT, 'TSbbCH6nss56q1D2NtSKquuNPYZ2ZDyKZg'],
    [tokens.DOGE, 'TPxT4UrAkbp4fK4CtjuMmvS9u85HjU7EYq'],
    [tokens.USDT, 'TEEQvDKY9sFQ65xxwhSH4QBkLD2NtwoN4a'],
    [tokens.RSF, 'TUHHCVD4MR7LXthbS2fBBw5bXARhBg4k5G'],
    [tokens.USDT, 'TPfAqGJ83NbVcRcsMFx7GJ749t9VV6cZvp'],
]

async function tronTvl() {
    const balances = {}

    await Promise.all(contracts.map(addTVL))
    // console.log(balances);
    return balances

    async function addTVL([token, contractAddress]) {
        // console.log(`token ${token.id} ${token.address} contract ${contractAddress} balance ${await getTokenBalance(token.address, contractAddress)}`);
        sdk.util.sumSingleBalance(balances, token.id, await getTokenBalance(token.address, contractAddress))
    }
}

module.exports = {
    tron: {
        tvl: tronTvl
    },
}