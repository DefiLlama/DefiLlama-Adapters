const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        "0x5569fd6991d1802dbee9bdd67e763fe7be67c7a9",
        "0xcBEA7739929cc6A2B4e46A1F6D26841D8d668b9E",
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.hashkey,
  },
  litecoin: {
    owners: [
        "ltc1qzjsgswkenmy9v6vm2jvkddeczwfuy9q7rshtxh",
        "LXeSRVh6WPan3u5AxEZkvvn1srKnN5BiAm",
    ],
  },
  optimism: {
    owners: [
        "0x5691a157ce38f1b362ab4a686ec7616fb04ba6f1",
        "0xC7556Bb9EB188888b1cce25c3587C36Be0809EC4",
    ],
  },
  arbitrum: {
    owners: [
        "0x03248f4759Ef5c4FdDd959aa07a5294e00B03e44",
        "0x25a58cee7928b3d6c1d392ebe1a97318aa5ff2f2",
    ],
  },
  avax: {
    owners: [
        "0x9bc72c8bb18d27bad9d0936be5d5e68fe2d37a29",
    ],
  },
  polygon: {
    owners: [
        "0xAa0400E5a90f697230638DbE76D9C49e4aC745B4",
    ],
  },
  tron: {
    owners: [
        "TYs8Aupg4iXDhifXm1kaCb1MfMcPjLn5RE",
        "TZBcnxpRJcYJkbVMCi6g69BZmTmNACQxpD",
    ],
  },
  bsc: {
    owners: [
        "0x8d13018cf3a136c4c6f6fad37ba880b4677a91d4",
        "0x6a276a58c5194ef196b58442f627dba070cb37bf",
    ],
  },
  solana: {
    owners: [
        "GDui3zpJC1xdnddCM2Vjp5Hnj97pQH1gDAHctyavx5iQ",
        "CrK188sdwoXzMCukUhwDdZmE3fEjsMfESwz8P8o5XbgT",
    ],
  },
  ton: {
    owners: [
        "UQBmo9W_9TZNlVzzH6f_L8CIC4N5GrYs3o8sjUsLXRzLHEU2",
        "UQDxsCGvjT-wPp-R-OePbXl4UwsVZs-02PItnmzaAuUxXAi2",
    ],
  },
  scroll: {
    owners: [
        "0x08c974911e29a7b23899139fb53fdb99aa6cab76",
        "0xdd261309c5b32c006f6ad9a0f16b872392479cdb",
    ],
  },
}

module.exports = cexExports(config)
