const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by Alphaping.',
  blockchains: {
    ethereum: {
      morpho: [
        '0xb0f05E4De970A1aaf77f8C2F823953a367504BA9',
        '0x6619F92861C760AD11BA0D56E8ED63A33EccE22B',
        '0xFa7ED49Eb24A6117D8a3168EEE69D26b45C40C63',
        '0x47fe8Ab9eE47DD65c24df52324181790b9F47EfC'
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
