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

// MIDAS TVL CALCULATION
async function getMidasTvl(api, config) {
  const totalSupply = await api.call({
    target: config.token,
    abi: 'uint256:totalSupply',
  });

  const price = await api.call({
    target: config.priceFeed,
    abi: 'int256:lastAnswer',
  });

  const supply = Number(totalSupply) / 1e18;
  const priceUSD = Number(price) / 1e8;
  return supply * priceUSD;
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

module.exports = adapterExport;