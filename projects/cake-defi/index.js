const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
       '0xc5a0a17eabbb0e64dcd567b5670c8c5d5c34128c',
       '0x94fa70d079d76279e1815ce403e9b985bccc82ac',
       '0xb5e2d774c4672aa4297272f62d61e8a041175cb5',
       '0x3ec49e613ae70beb0631d7666f46d4ff2813932e',
       '0xC889Faf456439Fb932B9Ce3d4F43D8078177fD29',
       '0x883C4599C455Fc337CA43BF9d63eBA45F995a769',

    ],
  },
  polygon: {
    owners: [
      '0xaa6c7eAF827E04185D7A6a6A6156195AB5BDBE4c',
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.cakeDefi
  },
  litecoin: {
    owners: ['MLYQxJfnUfVqRwfYXjDJfmLbyA77hqzSXE']
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'As Bake.io (formerly Cake DeFi) is a CeDeFi platform, its assets associated to the staking nodes are not included for the purposes of the TVL calculation. In this case, there are approximately $121.4M in DFI chain (nodes), and around $24.7M in ETH chain (nodes) as of 31 March 2023. The calculation methodology are as follows: DFI: 10846 (nodes) * 20K (collateral per node) *$0.56 = $121.4M. ETH: 430 * 32 *$1800 = $24.7M, we also do not track Bitcoin Cash and Dogecoin. Bake.io publishes information on all its nodes on its Transparency page here: https://bake.io/transparency.',
module.exports.hallmarks = [
  [1680516000, "Change Of Wallets"],
  [1700784000, "Change Of Wallets"]
]