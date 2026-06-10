const { getCuratorExport } = require("../helper/curators");

const owners = ["0x42D510eDeb9257f8D920d5B9f5109D95cB22419d"]

const configs = {
  methodology: "TVL is calculated by summing the assets deposited in all Morpho vaults curated by Galaxy on each supported chain.",
  blockchains: {
    ethereum: {
      morphoVaultOwners: owners,
    },
    base: {
      morphoVaultOwners: owners,
    },
  },
}

module.exports = getCuratorExport(configs)
