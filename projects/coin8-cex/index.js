const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x76d90b0f8150797d9eb4ce91bca2829f494c3766',
        '0x8332086fa910f6e72e9793778d91b6f9ef2d719d',
        '0xa63811cd3abdbc0bd0f668a9eb98b97a96ead95f',
        '0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1',
        '0xFBcE3974014022853136989149787df66D54E623',
        '0x66AAD5CA93438D565909De0bF444b45e543d98E9',
        '0x2355969e0692D41bCbB5e695513C0cF4Ae6059C2',
        '0x0733E99402D268D4475A8F5E45987Db04bA66181',
        '0xd83Daa277d9DAD1f34aDE22002806251f04f4a28',
        '0x748577Ce82346C61e9d6e52628Eda8dFaB3241b3',
        '0xaDc7cf570DDf2Ff99C723F946c7F5A5D34cF868C'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.coin8
  },
  arbitrum: {
    owners: [
        '0x3465136aa1ab5fd78bae06a91c280157532c62b8',
        '0xebb54920eda335dfcde8a904f8293bcb5ac64aff',
        '0x66AAD5CA93438D565909De0bF444b45e543d98E9'
    ]
  },
  bsc: {
    owners: [
        '0x8f3d8dde9f2687d93640ecede2a91b1dc3404bd6',
        '0xef01a7711d046af41597c308369b9c8d5873ae96',
        '0x9b9B873F2Bf299B0E8C5b2E8Ff220Dc5cb4330E1',
        '0xF4271F1c5ABa50B9c18d229311FD22C4Cc7B70b6',
        '0xa089b8de0eA45db84CCadE5751EE165A88F90b4F',
        '0xFBcE3974014022853136989149787df66D54E623',
        '0xC349541773D5eCa27D36E9bD95094920f4B7A536',
        '0x66AAD5CA93438D565909De0bF444b45e543d98E9'
    ]
  },
  solana: {
    owners: [
        '8HTUpmDQAXeMtKMyojVFY32iAzhG6tEg6zqvASAzHnNd',
        '9JSjQQMTmkTSGHT5s6aKnJop6q6hsqMvkTGLzrC9x1NP'
    ]
  },
  ripple: {
    owners: [
        'rKpRrFhAk8w3WzhoKDA9XrVf9F9CCUrnY5',
    ]
  },
  polygon: {
    owners: [
        '0x66AAD5CA93438D565909De0bF444b45e543d98E9',
    ]
  },
  avax: {
    owners: [
        '0x66AAD5CA93438D565909De0bF444b45e543d98E9',
    ]
  },
  tron: {
    owners: [
        'TWGV42YRYpK1rfMHZCYYxhK1fZDbTNrqzz',
        'TZD1mbbNqnffBRSr8zEjWo6L37vk3nxhvT',
        'TFjKKNBqrsjRhmPnimyArxTuPxq5HkG9T7'
    ]
  },
}

module.exports = cexExports(config)