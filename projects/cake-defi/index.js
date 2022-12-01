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
module.exports.methodology = 'We are not counting money in Nodes and Staking. In this case around $85m in DFI chain (nodes), and around $5.98m in ETH chain (nodes). DFI: 9511 (nodes) * 20K (collateral per node) *$0.45 = $85.6M ETH: 170  * 32 *$1100 = $5.98M. This data was collected on 28/11/22. You can take a deep look at their transparency page https://cakedefi.com/transparency'