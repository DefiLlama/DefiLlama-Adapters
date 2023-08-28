const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0x94fa70d079d76279e1815ce403e9b985bccc82ac',
    ],
  },
  bitcoin: {
    owners: ['38pZuWUti3vSQuvuFYs8Lwbyje8cmaGhrT']
  },
  litecoin: {
    owners: ['MLYQxJfnUfVqRwfYXjDJfmLbyA77hqzSXE']
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'As Cake DeFi is a CeDeFi platform, its assets associated to the staking nodes are not included for the purposes of the TVL calculation. In this case, there are approximately $121.4M in DFI chain (nodes), and around $24.7M in ETH chain (nodes) as of 31 March 2023. The calculation methodology are as follows: DFI: 10846 (nodes) * 20K (collateral per node) *$0.56 = $121.4M. ETH: 430 * 32 *$1800 = $24.7M, We also do not track bitcoincash and doge chain. Cake DeFi publishes information on all its nodes on its Transparency page here: https://cakedefi.com/transparency.',
module.exports.hallmarks = [
  [1680516000, "Change Of Wallets"],
]