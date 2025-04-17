const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      'bc1qxas7gqvqshpwl6dy85fm5rcgf9je2th9xnlwp4',
    ],
  },
  ethereum: {
    owners: [
      '0x112A52893b96E9679E854934A62841051a679dAA',
      '0x6297C8ec7662c10CdACFb3e9C04B571528d277E2',
    ],
  },
  cosmos: {
    owners: [
      'cosmos1j60cjs6fmm47xhyl0rtyzruz7aunmu2gxsqq87',
    ]
  },
  ethereumclassic: {
    owners: [
      '0xD936704458E4f8525B6bE7C0ebC5fE268BaB4977',
    ]
  },
}

module.exports = cexExports(config)
