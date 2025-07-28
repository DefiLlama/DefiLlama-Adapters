const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      //only wallets with more than 100 USD
        '0xd30b438df65f4f788563b2b3611bd6059bff4ad9',
        '0x4a8f1f5b2a3652131eac54a6f183a4a2cf44a9a6',
        '0x2ce910fbba65b454bbaf6a18c952a70f3bcd8299',
        '0xa28062bd708ce49e9311d6293def7df63f2b0816',
        '0x964b78ef2925f24c3a8d270c10522638dee5f17f',
        '0xd7efcbb86efdd9e8de014dafa5944aae36e817e4'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.okcoin
  },
  tron: {
    owners: [
        'TQ7wK19fhZZqLdj2Xcw2e6Ejs3cTZbfBbF',
    ]
  },
  avax: {
    owners: ["0x5793da1b0c41c7db8e3eb8dbcd18fdca94a58535"]
  },
  polygon: {
    owners: ["0x0f51a310a4dd79d373eb8be1c0ddd54570235443"]
  },
  okexchain: {
    owners: ["0x5b73841a54f6f2e8b179f1801f664f470d7f37ea"]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'This wallets where collect from here https://www.okcoin.com/proof-of-reserves/download Audit ID 500509486 , 06/08/2023, 19:00:00. We are only tracking BTC wallets with more than 0.1 BTC. We are only tracking ETH wallets with more than 100$.'

