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
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0x35d2d03607b9155b42cf673102fe58251ac4f644'
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
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  avax: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  fantom: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  arbitrum: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  optimism: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  polygon: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  era: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  linea: {
    owners: [
      '0x50be13b54f3eebbe415d20250598d81280e56772',
      '0xdb861e302ef7b7578a448e951aede06302936c28'
    ],
  },
  ripple: {
    owners: [
      'rQKKvBvEfXbTThkqrtqaY3sAKuW6iqcMzX',
      'rLMAAuqJowC5yMccaPnappeLM8vDfdiDTg',
      'rN8fxXkmsTbgMxmisfvtK5AXwauXRkjgvd'
    ],
  },
  sui: {
    owners: [
      '0x51fc8f63faf7b22d401623f9c3ae5183e564d701741770f12ad1851c6c45a0c8',
      '0x59097eed58f8306577b4e61c928253211c71426ab5eb023ad15cc11054080cf8'
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
      'EWSHJzKpzjpwz9GuNKkXWMHXAiwtB7obSGhdFKu5QZku',
      '5xYNhZRW1rEofFon3X2JgaZtrnu5vo5xXD61jHof3p37'
    ],
  },
  polkadot: {
    owners: [
      '15hTaSogYFyGyRJhXdpQWRR1J9oya5nj4nFppi4XgUVMCvmP',
      '14E9TaC4TGxUf63wrDCxFNvcwdDAo2s9XMcQaChwHS4EXqyF'
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking part of their cold wallets, more information here https://phemex.com/proof-of-reserves'