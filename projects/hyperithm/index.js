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
    },
    monad: {
      morphoVaultOwners: [
        '0xC56EA16EA06B0a6A7b3B03B2f48751e549bE40fD',
      ],
    }
  }
};

const mtokenConfig = {
  ethereum: {
    mHYPER: '0x9b5528528656DBC094765E2abB79F293c21191B9',
    mHyperETH: '0x5a42864b14C0C8241EF5ab62Dae975b163a2E0C1',
    mHyperBTC: '0xC8495EAFf71D3A563b906295fCF2f685b1783085',
  },
  xrplevm: {
    mXRP: '0x06e0B0F1A644Bb9881f675Ef266CeC15a63a3d47',
  },
  plasma: {
    mHYPER: '0xb31BeA5c2a43f942a3800558B1aa25978da75F8a',
  },
  bsc: {
    mXRP: '0xc8739fbBd54C587a2ad43b50CbcC30ae34FE9e34',
  },
};

const adapterExport = getCuratorExport(vaultConfigs);

Object.keys(mtokenConfig).forEach(chain => {
  const existingTvl = adapterExport[chain]?.tvl;
  adapterExport[chain] = {
    tvl: async (api) => {
      await existingTvl?.(api);
      const tokens = Object.values(mtokenConfig[api.chain]);
      const bals = await api.multiCall({ abi: 'uint256:totalSupply', calls: tokens });
      api.add(tokens, bals);
    }
  };
});

module.exports = adapterExport;