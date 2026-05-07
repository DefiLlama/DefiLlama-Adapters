const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: { owners: bitcoinAddressBook.bitmex },
  ethereum: {
    owners: [
       '0xEEA81C4416d71CeF071224611359F6F99A4c4294', // Etherscan Label (seems cold)
       '0xfb8131c260749c7835a08ccbdb64728de432858e'  // Etherscan Label (seems hot)
    ],
  },
  tron: {
    owners: [
       'TXByfwCqw899fEPAWTuF3gkhPvfLMLvdr9', 
       'TU2wL7Vw2QM5KvMatsjjBKA6kKTntzCyyb' 
    ],
  },
  solana: {
    owners: [
       'JnmCTvT4kewDDET2Yu3T1mJD6GAaTpmxBEPGKC7CMao', 
       '47qgBcQGEBuWqNsE7QZ8NsXoe6fm5xLV94TDoYJzhgUV' 
    ],
  },
  bsc: {
    owners: [
       '0xEEA81C4416d71CeF071224611359F6F99A4c4294', 
       '0xfB8131c260749c7835a08ccBdb64728De432858E' 
    ],
  },
  ripple: {
    owners: [
       'rWZSRkMfZzZERoQt1D3PaqNXQNqmCGaBs', 
       'rpY2qHHTXiTqCZP56vvsxbvuazBKLWBX5z' 
    ],
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We collect only wallets that have more than 20 bitcoins'