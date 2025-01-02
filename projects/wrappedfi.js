const { cexExports } = require('./helper/cex')
const ADDRESSES = require('./helper/coreAssets.json')

module.exports = {
  ...cexExports({
    ripple: {
      owners: ['r4Pr9aBnqN84hbkmJo4HwUtLj63E5vGFyE']
    },
    celo: {
      tokensAndOwners: [
        [ADDRESSES.null, '0x84d9dcAc2f00F2Cd903E340b5241EB6e5c198572']
      ]
    },
    ethereum: {
      tokensAndOwners: [
        [ADDRESSES.null, '0xD6873b9592AB601E6cE6a6A781799d54961942F3']
      ]
    },
  }),
  methodology: 'The TVL consists of the underlying capital held in custody.'
};