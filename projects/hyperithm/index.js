const ADDRESSES = require('../helper/coreAssets.json');
const { getCuratorExport } = require("../helper/curators");

// MIDAS CONTRACTS CONFIGURATION
const MIDAS_MHYPER = {
  ethereum: {
    token: '0x9b5528528656DBC094765E2abB79F293c21191B9',
    priceFeed: '0x43881b05c3be68b2d33eb70addf9f666c5005f68',
  },
  plasma: {
    token: '0xb31bea5c2a43f942a3800558b1aa25978da75f8a',
    priceFeed: '0xfc3e47c4da8f3a01ac76c3c5ecfbfc302e1a08f0',
  }
};

const MIDAS_MXRP = {
  bsc: {
    token: '0xc8739fbBd54C587a2ad43b50CbcC30ae34FE9e34',
    priceFeed: '0x3BdE0b7B59769Ec00c44C77090D88feB4516E731',
  },
  xrplevm: {
    token: '0x06e0B0F1A644Bb9881f675Ef266CeC15a63a3d47',
    priceFeed: '0xFF64785Ee22D764F8E79812102d3Fa7f2d3437Af',
  }
};

// MIDAS TVL CALCULATION
async function getMidasTvl(api, config) {
  const totalSupply = await api.call({
    target: config.token,
    abi: 'uint256:totalSupply',
  });

  const rate = await api.call({
    target: config.priceFeed,
    abi: 'int256:lastAnswer',
  });

  const supply = Number(totalSupply) / 1e18;
  const sharePrice = Number(rate) / 1e8;
  return supply * sharePrice;
}

// VAULT CONFIGURATIONS BY BLOCKCHAIN
const configs = {
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

const adapterExport = getCuratorExport(configs);

const ethereumTvl = adapterExport.ethereum.tvl;
adapterExport.ethereum.tvl = async (api) => {
  await ethereumTvl(api);

  const midasTvl = await getMidasTvl(api, MIDAS_MHYPER.ethereum);
  api.add(ADDRESSES.ethereum.USDC, midasTvl * 1e6);
};

const plasmaTvl = adapterExport.plasma.tvl;
adapterExport.plasma.tvl = async (api) => {
  await plasmaTvl(api);
  const midasTvl = await getMidasTvl(api, MIDAS_MHYPER.plasma);
  api.add(ADDRESSES.plasma.USDT0, midasTvl * 1e6);
};

const bscTvl = adapterExport.bsc?.tvl;
adapterExport.bsc = {
  tvl: async (api) => {
    if (bscTvl) await bscTvl(api);
    const xrpAmount = await getMidasTvl(api, MIDAS_MXRP.bsc);
    api.add("0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE", xrpAmount * 1e18);
  }
};

const xrplevmTvl = adapterExport.xrplevm?.tvl;
adapterExport.xrplevm = {
  tvl: async (api) => {
    if (xrplevmTvl) await xrplevmTvl(api);
    const xrpAmount = await getMidasTvl(api, MIDAS_MXRP.xrplevm);
    api.add(ADDRESSES.xrplevm.XRP, xrpAmount * 1e18);
  }
};

module.exports = adapterExport;