const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Vault Bridge and its partners.',
  blockchains: {
    ethereum: {
      morpho: [
        '0xBEefb9f61CC44895d8AEc381373555a64191A9c4',
        '0xc54b4E08C1Dcc199fdd35c6b5Ab589ffD3428a8d',
        '0x31A5684983EeE865d943A696AAC155363bA024f9',
        '0x812B2C6Ab3f4471c0E43D4BB61098a9211017427',
      ],
      erc4626: [
        '0x3DD459dE96F9C28e3a343b831cbDC2B93c8C4855',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
