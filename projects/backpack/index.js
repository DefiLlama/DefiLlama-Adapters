const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

// https://dune.com/21co/backpack-exchange
const config = {
  solana: {
    owners: [
      '43DbAvKxhXh1oSxkJSqGosNw3HpBnmsWiak6tB5wpecN',
      'BbHG9GvPActFGogv3iNrpDAj4qpXr8t3jF16uGxXcKci',
      '9NJmj9VaTU9D7ytdzy5RHMrfAgw2pYwqnUhuMqatcsr',
      'HwDX5eJkzPAJ7y7ENrH23HaDGUgB4nXPxG8UsB4cEMGE',
      'HgTWrWU195u6s4v3JiEjJFCb6J6wxtQh8DAYV63tCx6Q',
      'DFFN6XgrTYDR2uFvaXJFRcFrMrtt6ZbPxpDs3mVbpxuR'
    ],
  },
  ethereum: {
    owners: [
      '0x2228e5704B637131A3798A186CAF18366c146f74',
      '0x6a3eAb9Ee70C82A2B13708041f2C5892bEa6857B',
      '0xEC8F9ef3031b0CdF05E42e0Ece8D6397F92595e8'
    ],
  },
    bitcoin: {
      owners: bitcoinAddressBook.backpack,
    },
}

module.exports = cexExports(config)