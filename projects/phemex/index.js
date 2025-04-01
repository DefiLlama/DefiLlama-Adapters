const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.phemex
  },
  ethereum: {
    owners: [
      '0xf7D13C7dBec85ff86Ee815f6dCbb3DEDAc78ca49',
      '0xdb861e302ef7b7578a448e951aede06302936c28',
      '0x9022B72D67999A3b0d1330eCefCa56f83d2ec52C',
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  bsc: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28',
    ],
  },
  base: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  avax: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  fantom: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  arbitrum: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  optimism: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  polygon: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  era: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  linea: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772'
    ],
  },
  ripple: {
    owners: [
      'rQKKvBvEfXbTThkqrtqaY3sAKuW6iqcMzX',
      'rLMAAuqJowC5yMccaPnappeLM8vDfdiDTg',
    ],
  },
  sui: {
    owners: [
      '0x51fc8f63faf7b22d401623f9c3ae5183e564d701741770f12ad1851c6c45a0c8',
    ],
  },
  tron: {
    owners: [
      'THAABzWrhp84Nr7gxss7qhtzA5mp3d1qUo',
      'TMHKjGvQ2trQkBEnAgx7RvV77Xn8w1JDP7',
    ],
  },
  solana: {
    owners: [
      'EWSHJzKpzjpwz9GuNKkXWMHXAiwtB7obSGhdFKu5QZku'
    ],
  },
  polkadot: {
    owners: [
      '15hTaSogYFyGyRJhXdpQWRR1J9oya5nj4nFppi4XgUVMCvmP'
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking part of their cold wallets, more information here https://phemex.com/proof-of-reserves'