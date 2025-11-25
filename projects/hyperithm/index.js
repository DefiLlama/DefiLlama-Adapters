const { getCuratorExport } = require("../helper/curators");

const vaultConfigs = {
  methodology: 'Count all assets are deposited in all vaults curated by Hyperithm.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0xC56EA16EA06B0a6A7b3B03B2f48751e549bE40fD',
        '0x16fa314141C76D4a0675f5e8e3CCBE4E0fA22C7c'
      ],
      euler: [
        '0x3cd3718f8f047aA32F775E2cb4245A164E1C99fB',
      ]
    },
    arbitrum: {
      morphoVaultOwners: [
        '0xC56EA16EA06B0a6A7b3B03B2f48751e549bE40fD',
      ],
    },
    hyperliquid: {
      morphoVaultOwners: [
        '0x51afd54ff95c77A15E40E83DB020908f33557c97',
      ],
    },
    plasma: {
      erc4626: [
        '0xb74760fd26400030620027dd29d19d74d514700e' // Gearbox Hyperithm USDT0
      ]
    }
  }
};

const adapterExport = getCuratorExport(vaultConfigs);

module.exports = adapterExport;