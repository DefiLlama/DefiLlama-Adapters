const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const address = {
  struct: {
    gmxYieldSource: "0x6aE12b0adF9716181c07D19dfe76442AB1b3817b",
    gmxFactory: "0x46f8765781ac36e5e8f9937658fa311af9d735d7",
  },
  token: {
    usdc: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
    btcb: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    fsGlp: "0x9e295b5b976a184b14ad8cd72413ad846c299660",
  },
};

const chain = "avax";

async function tvl(ts, _, { [chain]: block }, { api = undefined }) {
  const { output: numberOfVaults } = await sdk.api.abi.call({
    abi: "function totalProducts() external view returns (uint256)",
    target: address.struct.gmxFactory,
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
      target: address.struct.gmxFactory,
      params: i,
    })),
    chain,
    block,
  });

  vaults.push({ output: address.struct.gmxYieldSource });

  return sumTokens2({
    api,
    owners: vaults.map((i) => i.output),
    tokens: [address.token.btcb, address.token.usdc, address.token.fsGlp],
  });
}

module.exports = {
  avax: {
    tvl,
  },
};
