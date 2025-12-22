const { cexExports } = require('../helper/cex')
const { mergeExports, getStakedEthTVL } = require("../helper/utils");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.bitfinex,
  },
  ethereum: {
    owners: [
      '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec', // ETH/ERC20 hot wallet
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // ETH/ERC20 cold wallet
      '0xC61b9BB3A7a0767E3179713f3A5c7a9aeDCE193C', // ETH/ERC20 cold wallet
      '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', // ETH/ERC20 (old) hot wallet
    ]
  },
  polygon: {
    owners: [
      '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec', //Polygon hot wallet
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', //Polygon cold wallet
      // '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', //Polygon (old) hot wallet
    ]
  },
  avax: {
    owners: [
      '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec', // Avalanche (C-Chain) hot wallet
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Avalanche (C-Chain) cold wallet
      // '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', // Avalanche (old) hot wallet
    ]
  },
  cardano: {
    owners: [
      'DdzFFzCqrhstFM5XQYA28G2ekCkvpb6bPdhUT5vcsZtqYT3i7wAtjNPCTEGNbUmgL4ym9udeV5k6Utc3vCmAbky6Bvda72r1SQknZH9L', //Cardano ADA hot wallet
      'addr1qxrlkh6yh0km5m5n7923syel0yqqvc3pjrnqrzrz3gwpxd70prfqwehanuxzkwmv55ff9gr7tjx5vymykd2galr9chaqlwjwm9',//Cardano ADA cold wallet
    ]
  },
  algorand: {
    owners: [
      'JDQ7EW3VY2ZHK4DKUHMNP35XLFPRJBND6M7SZ7W5RCFDNYAA47OC5IS62I',
      'UGYKOYFAEB6373DVH6ME6BFVHNG6BMWTYU6VZBMFFI2YQ72QACBSZLNYZ4',
      'NWPUVAIOBZHBVLCCYGERFGQ3ZRQPSJ7R6UB3NXFBF552BGYAGX4I5TCVCY'
  ]
  },
  aptos: {
    owners: ['0xfd9192f8ad8dc60c483a884f0fbc8940f5b8618f3cf2bbf91693982b373dfdea']
  },
  cosmos: {
    owners: [
      'cosmos1h9ymfm2fxrqgd257dlw5nku3jgqjgpl59sm5ns', //Cosmos hot wallet
      // 'cosmos1jtdkj8hxhj88jxv8lul9xvdpnwsl00evvvpnhj', //Cosmos cold wallet
    ]
  },
  elrond: {
    owners: ['erd1a56dkgcpwwx6grmcvw9w5vpf9zeq53w3w7n6dmxcpxjry3l7uh2s3h9dtr']
  },
  eos: {
    owners: [
      'bitfinexdep1',
      'bitfinexcw21' ,
      'bitfinexcw23' ,
      'bitfinexcw24' , 
      'bitfinexcw25' ,
      'bitfinexcw31' ,
      'bitfinexcw22' ,
      'bitfinexcw33' ,
      'bitfinexcw55' ,
    ]
  },
  ethereumclassic: {
    owners: [
      '0x618F37D7ff7B140E604172466CD42D1Ec35E0544',
      '0x88037f361891A0B5De3C0C30632fBcA7DB2D341F',
    ]
  },
  fantom: {
    owners: ['0xed9eef56e64a8e779cfae9ddedb25d11ba2b2425']
  },
  litecoin: {
    owners: [
      'LXTQdps2Pf83WdAXMinboiqLsEjSWrwJCD',
      'LNSFU7hmF6GP2AFdcrCgd4QvFimvspviSs'
    ]
  },
  near: {
    owners: [
      '383e50ea1a754ed3acd0d59116f221add87adb82559f31ca6d377f058fe83375',
      '965c8b57b7f36fe9a40ce6188d444ca78708e4d83843b108f7f53d0fe5332076',
    ]
  },
  polkadot: {
    owners: [
      '12T1tgaYZzEkFpnPvyqttmPRJxbGbR4uDx49cvZR5SRF8QDu',
      // '1UJSCYLh44UYhkm1WwXAwT2W8nirTD74VzPsdhfsstY8S3u',
      '13AE11jLvxcxsjqaSoWFXCTGUfbjXb1gmZTY8x3TXJzWutmf'
    ]
  },
  solana: {
    owners: [
      'FxteHmLwG9nk1eL4pjNve3Eub2goGkkz6g6TbvdmW46a', //Solana hot wallet
      'FyJBKcfcEBzGN74uNxZ95GxnCxeuJJujQCELpPv14ZfN', //Solana cold wallet
      'GnCRxKqUEPouYMvTb5nJMGrDB3VkTXZnDTaDuVZdnWA3',
      'J4rzLDLhLWFpjSgCMCcxTU84bQ8AH5vhgjwq7SjYVk8Q'
    ]
  },
  tezos: {
    owners:[
      'tz1KtGwriE7VuLwT3LwuvU9Nv4wAxP7XZ57d', //Tezos (XTZ) hot wallet
      'tz1fK1ZmVMtshYoCoQ1zC1SCCUG4SnbyR75p', //Tezos (XTZ) cold wallet
      'tz1N47UGiVScUUvHemXd2kGwJi44h7qZMUzp', //Tether USDt (Tezos) hot wallet
    ]
  },
  tron: {
    owners: [
      'TXFBqBbqJommqZf7BV8NNYzePh97UmJodJ', //Tron TRX/TRC10/TRC20 hot wallet
      'TMhJviFWiaxvqKLdng9dmsi1H5H5yTGEeu', // Tron TRX/TRC10/TRC20 cold wallet
    ]
  },
  zilliqa: {
    owners: [
      // 'zil1xfsrre5qgx0mqg99xc0l2cuyu9ntt259ngsu7s', //Zilliqa hot wallet
      // 'zil184u2al6n0nrks06xjgq080hc95f77ttd7rkqvn', // Zilliqa cold wallet
    ]
  },
  doge: {
    owners: ['DQQckuSMsiFjaAdGiNjvDyswcz9RWQU2xe']
  }
}

const withdrawalAddresses = [
  '0xe733455faddf4999176e99a0ec084e978f5552ed',
  '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec',
]

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: withdrawalAddresses, size: 200, sleepTime: 20_000, proxy: true }) } },
])
