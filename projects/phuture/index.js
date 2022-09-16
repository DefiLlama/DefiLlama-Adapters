const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const vTokenAbi = require("./abis/vToken.abi.json");
const networks = require("./networks.json");
const { getChainTransform } = require("../helper/portedTokens");

const tvl = (chain) => async (timestamp, block, chainBlocks) => {
  const vTokenFactory = networks[chain].vTokenFactory;
  const toBlock = await getBlock(timestamp, chain, chainBlocks);
  const { output: logs } = await sdk.api.util.getLogs({
    target: vTokenFactory.address,
    topic: "VTokenCreated(address,address)",
    keys: [],
    fromBlock: vTokenFactory.blockNumber,
    toBlock,
    chain
  });

  const vTokens = logs.map(({ data }) => ({
    target: `0x${data.substr(26, 40)}`.toLowerCase(),
    asset: `0x${data.substr(-40)}`.toLowerCase()
  }));

  const { output } = await sdk.api.abi.multiCall({
    abi: vTokenAbi.virtualTotalAssetSupply,
    calls: vTokens.map(({ target }) => ({ target })),
    block,
    chain
  });

  const chainTransform = await getChainTransform(chain)

  return Object.fromEntries(output
    .filter(({ output }) => output)
    .map(({ output }, index) => [chainTransform(vTokens[index].asset), output])
  );
};

module.exports = {
  methodology: "TVL considers tokens deposited to Phuture Indices",
  timetravel: true,
  misrepresentedTokens: true
};

Object.keys(networks).forEach((chain) => {
  module.exports[chain] = {
    tvl: tvl(chain)
  };
});
