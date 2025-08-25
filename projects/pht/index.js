const { onChainTvl } = require('../helper/balancer')

module.exports = {
  methodology: "Sum of all the PHT tokens locked in TanukiX vault",
  pht: {
    tvl: onChainTvl('0xe75220cB014Dfb2D354bb59be26d7458bB8d0706', 72431824)
  },
}
