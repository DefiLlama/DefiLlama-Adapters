const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by 9Summits.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x23E6aecB76675462Ad8f2B31eC7C492060c2fAEF',
      ],
      morpho: [
        '0xb5e4576C2FAA16b0cC59D1A2f3366164844Ef9E0', // co-curator with tulip-capital
        '0x1E2aAaDcF528b9cC08F43d4fd7db488cE89F5741', // co-curator with tulip-capital
        '0x0bB2751a90fFF62e844b1521637DeD28F3f5046A', // co-curator with tulip-capital
      ],
      turtleclub: [
        '0xa853d8f5f253468495c5a92d54a3fe6cca2aa26b',
        '0x7388d4b5c4cfc96c9105de913717ba7519178129',
        '0xDe7CFf032D453Ce6B0a796043E75d380Df258812',
        '0xAF87B90E8a3035905697E07Bb813d2d59D2b0951',
      ],
    },
    base: {
      morphoVaultOwners: [
        '0x23E6aecB76675462Ad8f2B31eC7C492060c2fAEF',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0x59e608E4842162480591032f3c8b0aE55C98d104',
      ],
    },
  }
}

module.exports = getCuratorExport(configs)
