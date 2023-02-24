const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
       '0x8b802fa7b71ea532187e432d9b87d24cc904243a', // https://blog.cakedefi.com/whats-new-with-our-lending-service/
    ],
  },
  bitcoin: {
    owners: ['3HRPnc4SddsFjrLVTfuTZJ2kQhdyCaHT4G']
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'As Cake DeFi is a CeDeFi platform, its assets associated to the staking nodes are not included for the purposes of the TVL calculation. In this case, there are approximately $85m in DFI chain (nodes), and around $5.98m in ETH chain (nodes) as of 28 November 2022. The calculation methodology are as follows: DFI: 9511 (nodes) * 20K (collateral per node) *$0.45 = $85.6M. ETH: 170 * 32 *$1100 = $5.98M. Cake DeFi publishes information on all its nodes on its Transparency page here: https://cakedefi.com/transparency.'