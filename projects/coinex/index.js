const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x187e3534f461d7c59a7d6899a983a5305b48f93f',
        '0x33ddd548fe3a082d753e5fe721a26e1ab43e3598',
        '0x90f86774e792e91cf81b2ff9f341efca649343a6',
        '0x85cf05f35b6d542ac1d777d3f8cfde57578696fc',
        '0xda07f1603a1c514b2f4362f3eae7224a9cdefaf9',
        '0x601a63c50448477310fedb826ed0295499baf623',
        '0x53eb3ea47643e87e8f25dd997a37b3b5260e7336',
        '0xd782e53a49d564f5fce4ba99555dd25d16d02a75',
        '0x5ad4d300fa795e9c2fe4221f0e64a983acdbcac9',  
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.coinex
  },
  tron: {
    owners: [
        'TTMWTPp1vonsdYBuLey3x8k6PsAvZcdR1J',
        'TFp4V3S9JqJyQAMMCewyn4aAaLueJwzS7H',
    ]
  },
  starknet: {
    owners: [
        '0x00fb108ed29e1b5d82bb61a39a15bbab410543818bf7df9be3c0f5dd0d612cf3'
    ]
  },
}

module.exports = cexExports(config)