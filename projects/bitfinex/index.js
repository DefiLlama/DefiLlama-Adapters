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
  }
}

module.exports = cexExports(config)
