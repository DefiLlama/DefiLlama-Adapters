const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
    ethereum: {
        owners: [
            '0x679Fb19dEc9d66C34450a8563FfDFD29C04e615A',
            '0x0323718324218dcBfF7c9f89bA5a5954F61A6c74',
            '0x794C629e4403CA7CEE126Cc19d6C7b002D0238a5',
        ],
    },
    bitcoin: {
        owners: bitcoinAddressBook.arkhamExchange
    },
    solana: {
        owners: [
            'H2qEpXtSEzQTH5xNFpA8VA1W2NKNZWxUoVpascxyWAK1',
            '3huamNpghPSPbgQSLX56B18Sj1hq5SE4KGxwTvhwJGnC',
        ],
    },
    doge: {
        owners: [
            '9xFftuJonFHopj9FB6tyW1kyxqusr4jrGh',
        ]
    },
    avax: {
        owners: [
            '0xDc2822D0685c0CcEAb07b35d6de4aC9280FB9cFF',
            '0x34407900475cEF87acE1597670A9A42F31961d02',
            '0xaF4E837d27cD6A5B33D67d51b88Ae42c0Bb3f1af',
        ]
    },
    ton: {
        owners: [
            'UQDT3cimS92wrKXrc7U6quPIM1ose_N5-R4U5byIUDHkF8pt',
            'UQDd2gNTRcIsgdUgf0DYMVcpxZuV78hegZ4D1tIj7xLKTwWn',
        ]
    },
}

module.exports = cexExports(config)
module.exports.methodology = 'Wallets can be tracked here: https://intel.arkm.com/explorer/entity/arkham-exchange'
