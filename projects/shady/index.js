const { sumTokens2 } = require('../helper/solana')

const owner = '6WEsL1dvUQbTwjtMvKvZZKqv4GwG6b9qfCQSsa4Bpump' // Shady program ID

async function pool2(api) {
    return sumTokens2({
        api,
        solOwners: [owner],
        tokenAccounts: [
            '7DjuVG7uiwcvjtVz23mwyBGqfMRS12nGhrvT459S36kx', // Shady token account
            '3nnSedpFLRGa16CAyqQMj5EcxGGgbsBz4fq37T3MosBQ', // WSOL token account
        ]
    })
}

module.exports = {
    timetravel: false,
    solana: { pool2, tvl: () => ({}) },
}