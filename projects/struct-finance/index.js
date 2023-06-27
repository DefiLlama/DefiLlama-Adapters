const sdk = require("@defillama/sdk");
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

const chain = "avax";

async function tvl(ts, _, { [chain]: block }, { api }) {
  const { output: numberOfVaults } = await sdk.api.abi.call({
    abi: "function totalProducts() external view returns (uint256)",
    target: addresses.struct.gmxFactory,
    chain,
    block,
  });

  let indexArray = [];
  for (let i = 0; i < numberOfVaults; i++) {
    indexArray.push(i);
  }

  const { output: vaults } = await sdk.api.abi.multiCall({
    abi: "function allProducts(uint256) external view returns (address)",
    calls: indexArray.map((i) => ({
      target: addresses.struct.gmxFactory,
      params: i,
    })),
    chain,
    block,
  });

  vaults.push({ output: addresses.struct.gmxYieldSource });

  return sumTokens2({
    api,
    owners: vaults.map((i) => i.output),
    tokens: [ADDRESSES.avax.BTC_b, ADDRESSES.avax.USDC, addresses.token.fsGlp],
  });
}

module.exports = {
  avax: {
    tvl,
  },
};
