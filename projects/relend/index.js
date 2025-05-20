const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Relend Network.',
  blockchains: {
    ethereum: {
      morpho: [
        '0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a',
        '0xB9C9158aB81f90996cAD891fFbAdfBaad733c8C6',
      ],
    },
    base: {
      morpho: [
        '0x70F796946eD919E4Bc6cD506F8dACC45E4539771',
      ],
    },
    swellchain: {
      euler: [
        '0xc5976e0356f0A3Ce8307fF08C88bB05933F88761',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
