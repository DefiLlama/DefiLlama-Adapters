const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '1Kr6QSydW9bFQG1mXiPNNu6WpJGmUa9i1g',  //BTC hot wallet
      '3JZq4atUahhuA9rLhXLMhhTo133J9rF97j',  //BTC cold wallet
      'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97', // BTC cold wallet
    ],
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
      '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', //Polygon (old) hot wallet
    ]
  },
  avalanche: {
    owners: [
      '0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec', // Avalanche (C-Chain) hot wallet
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Avalanche (C-Chain) cold wallet
      '0x876EabF441B2EE5B5b0554Fd502a8E0600950cFa', // Avalanche (old) hot wallet
    ]
  },
  cardano: {
    owners: [
      'DdzFFzCqrhstFM5XQYA28G2ekCkvpb6bPdhUT5vcsZtqYT3i7wAtjNPCTEGNbUmgL4ym9udeV5k6Utc3vCmAbky6Bvda72r1SQknZH9L', //Cardano ADA hot wallet
      'addr1qxrlkh6yh0km5m5n7923syel0yqqvc3pjrnqrzrz3gwpxd70prfqwehanuxzkwmv55ff9gr7tjx5vymykd2galr9chaqlwjwm9',//Cardano ADA cold wallet
    ]
  },
  algorand: {
    owners: ['JDQ7EW3VY2ZHK4DKUHMNP35XLFPRJBND6M7SZ7W5RCFDNYAA47OC5IS62I'],
  },
  aptos: {
    owners: ['0xfd9192f8ad8dc60c483a884f0fbc8940f5b8618f3cf2bbf91693982b373dfdea']
  },
  cosmos: {
    owners: [
      'cosmos1h9ymfm2fxrqgd257dlw5nku3jgqjgpl59sm5ns', //Cosmos hot wallet
      'cosmos1jtdkj8hxhj88jxv8lul9xvdpnwsl00evvvpnhj', //Cosmos cold wallet
    ]
  },
}

module.exports = cexExports(config)
