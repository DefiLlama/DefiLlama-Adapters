const {
  getTVLData,
  getERC4626VaultFundsByChain,
  getL1VaultOnlyFundsByChain,
} = require("./helper");

const ethTvl = async (api) => {
  await getTVLData(api);
  await getL1VaultOnlyFundsByChain(api);
};

const polygonTvl = async (api) => {
  await getERC4626VaultFundsByChain(api)
  await getL1VaultOnlyFundsByChain(api)
};

module.exports = {
  methodology:
    "TVL is the total supply of our vault tokens, multiplied by their corresponding share price. The share price is calculated based on the value of positions taken by vaults both on ethereum and optimism networks",
  ethereum: {
    tvl: ethTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  hallmarks: [
    ['2023-03-28', "Brahma vaults discontinued, Brahma Console announced [not tracked here]"],
  ],
};
