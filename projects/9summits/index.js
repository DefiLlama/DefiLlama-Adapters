const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are depoisted in all vaults curated by 9Summits.',
  blockchains: {
    ethereum: {
      morpho: [
        '0xb5e4576C2FAA16b0cC59D1A2f3366164844Ef9E0',
        '0xD5Ac156319f2491d4ad1Ec4aA5ed0ED48C0fa173',
        '0x1E2aAaDcF528b9cC08F43d4fd7db488cE89F5741',
        '0x00B6f2C15E4439749f192D10c70f65354848Cf4b',
        '0x0bB2751a90fFF62e844b1521637DeD28F3f5046A',
      ],
    },
    base: {
      morpho: [
        '0x5496b42ad0deCebFab0db944D83260e60D54f667',
        '0xF540D790413FCFAedAC93518Ae99EdDacE82cb78'
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
