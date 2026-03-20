const ADDRESSES = require('../helper/coreAssets.json');
const { getCuratorExport } = require("../helper/curators");

const MMEV_VAULTS = {
  ethereum: {
    token: '0x030b69280892c888670EDCDCD8B69Fd8026A0BF3',
    dataFeed: '0x5f09Aff8B9b1f488B7d1bbaD4D89648579e55d61',
    underlying: ADDRESSES.ethereum.USDC,
    underlyingDecimals: 6,
  },
  plume_mainnet: {
    token: '0x7d611dC23267F508DE90724731Dc88CA28Ef7473',
    dataFeed: '0x4e5B43C9c8B7299fd5C7410b18e3c0B718852061',
    underlying: ADDRESSES.plume_mainnet.USDC,
    underlyingDecimals: 6,
  },
  etlk: {
    token: '0x5542F82389b76C23f5848268893234d8A63fd5c8',
    dataFeed: '0x077670B2138Cc23f9a9d0c735c3ae1D4747Bb516',
    underlying: ADDRESSES.etlk.USDC,
    underlyingDecimals: 6,
  },
};

const MEVBTC = {
  token: '0xb64C014307622eB15046C66fF71D04258F5963DC',
  dataFeed: '0xffd462e0602Dd9FF3F038fd4e77a533f8c474b65',
  underlying: ADDRESSES.ethereum.WBTC,
  underlyingDecimals: 8,
};

const configs = {
  methodology: 'Count all assets deposited in all vaults curated by RockawayX.',
  blockchains: {
    solana: {
      kaminoLendVaults: ['DWSXb18xZApz29vnQpgR2m6MynCT7PznaXt7Ut7M7KaP'], // Kamino RWA USDC
    },
  }
}

async function midasDataFeedTvl(api, { token, dataFeed, underlying, underlyingDecimals }) {
  const totalSupply = await api.call({ abi: 'uint256:totalSupply', target: token });
  const lastAnswer = await api.call({ abi: 'int256:lastAnswer', target: dataFeed });
  if (lastAnswer <= 0) return;
  const feedDecimals = await api.call({ abi: 'uint8:decimals', target: dataFeed });

  const totalValue = (BigInt(lastAnswer) * BigInt(totalSupply) * BigInt(10 ** underlyingDecimals)) /
                     (BigInt(10 ** Number(feedDecimals)) * BigInt(10 ** 18));
  api.add(underlying, totalValue.toString());
}

const adapterExport = getCuratorExport(configs);

for (const [chain, vault] of Object.entries(MMEV_VAULTS)) {
  adapterExport[chain] = {
    tvl: async (api) => {
      await midasDataFeedTvl(api, vault);
    }
  };
}

// Add mevBTC on ethereum
const baseEthTvl = adapterExport.ethereum.tvl;
adapterExport.ethereum.tvl = async (api) => {
  await baseEthTvl(api);
  await midasDataFeedTvl(api, MEVBTC);
};

module.exports = adapterExport;
