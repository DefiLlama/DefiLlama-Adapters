const { cexExports } = require('../helper/cex')

// https://dune.com/21co/backpack-exchange
const config = {
    solana: {
        owners: [
            '43DbAvKxhXh1oSxkJSqGosNw3HpBnmsWiak6tB5wpecN',
            'BbHG9GvPActFGogv3iNrpDAj4qpXr8t3jF16uGxXcKci'
        ],
        tokens: [
            'hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux', // HNT
            'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', // JTO
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
            'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', // PYTH
            'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', // RNDR
            'mb1eu7TzEc71KxDpsmsKoucSSuuoGLv1drys1oP2jh6', // MOBILE
            'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
            'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
            'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' // JUP
        ]
    },
}

module.exports = cexExports(config)