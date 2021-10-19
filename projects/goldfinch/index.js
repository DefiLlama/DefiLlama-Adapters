const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const seniorPool = "0x8481a6EbAf5c7DABc3F7e09e44A89531fd31F822";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const netBalance = (
    await sdk.api.abi.call({
      abi: abi.assets,
      target: seniorPool,
      ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, USDC, netBalance);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "We count liquidity that's on the Senior Pool (liquidity provider supply) through its Contract",
};
