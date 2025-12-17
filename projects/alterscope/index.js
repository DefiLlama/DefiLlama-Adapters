const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Alterscope.',
  blockchains: {
    ethereum: {
      eulerVaultOwners: [
        '0x0d8249DD621fB1c386A7A7A949504035Dd3436A3',
      ],
    },
    base: {
      eulerVaultOwners: [
        '0xf3ED34523E35279a1deB2960c0aC46Be8E23a2f4'
      ]
    },
    starknet: {
      vesu: [
        '0x7bafdbd2939cc3f3526c587cb0092c0d9a93b07b9ced517873f7f6bf6c65563',
        '0x27f2bb7fb0e232befc5aa865ee27ef82839d5fad3e6ec1de598d0fab438cb56',
        '0x5c678347b60b99b72f245399ba27900b5fc126af11f6637c04a193d508dda26',
        '0x2906e07881acceff9e4ae4d9dacbcd4239217e5114001844529176e1f0982ec',
      ],
    },
  }
}

module.exports = {
  ...getCuratorExport(configs),

  // starknet doesn't support historical queries
  timetravel: false,
  hallmarks: [
    ['2025-06-01', "Start tracking vaults on starknet"],
  ]
}
