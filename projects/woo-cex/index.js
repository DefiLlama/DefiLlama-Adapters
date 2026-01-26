const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const owners = [
  '0x0d83f81bc9f1e8252f87a4109bbf0d90171c81df',
  '0x63DFE4e34A3bFC00eB0220786238a7C6cEF8Ffc4',
  '0xE505Bf08C03cc0FA4e0FDFa2487E2c11085b3FD9',
  '0xea319fd75766f5180018f8e760f51c3d3c457496',
]

const config = {
  bitcoin: { owners: bitcoinAddressBook.wooCEX },
  ethereum: { owners },
  fantom: { owners },
  avax: { owners },
  bsc: { owners },
  arbitrum: { owners },
  polygon: { owners },
  optimism: { owners },
  tron: {
    owners: [
      'TDZeVyGHgN5bErmWumuYRtXCrYMoUzKF7L',
      'TSC2VZai39isPj5DzByYgaBtjpBHbDcTgd'
    ]
  },
  //lunc/luna terra143zgtv9ntwcfkslrjfp6c5nvdtl8lqmvff5wz6 // terra1t2gpws06d6yjauwhqy0cqtu2g5gwtghlw60ht4
}

module.exports = cexExports(config)
module.exports.methodology = 'This wallets where provide by WOO team'