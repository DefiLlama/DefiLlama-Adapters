const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require("../helper/unwrapLPs");

const addresses = {
  struct: {
    gmxYieldSource: "0x6aE12b0adF9716181c07D19dfe76442AB1b3817b",
    gmxFactory: "0x46f8765781ac36e5e8f9937658fa311af9d735d7",
  },
  token: {
    fsGlp: "0x9e295b5b976a184b14ad8cd72413ad846c299660",
  },
};

async function tvl(ts, _, __, { api }) {
  const vaults = await api.fetchList({  lengthAbi: 'uint256:totalProducts', itemAbi: "function allProducts(uint256) external view returns (address)", target: addresses.struct.gmxFactory})
  vaults.push(addresses.struct.gmxYieldSource);

  return sumTokens2({
    api,
    owners: vaults,
    tokens: [ADDRESSES.avax.BTC_b, ADDRESSES.avax.USDC, addresses.token.fsGlp],
  });
}

module.exports = {
  avax: {
    tvl,
  },
};
