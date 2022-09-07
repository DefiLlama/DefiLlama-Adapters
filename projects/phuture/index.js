const { getBlock } = require("../helper/getBlock");
const sdk = require("@defillama/sdk");
const vTokenAbi = require("./abis/vToken.abi.json");
const BigNumber = require("bignumber.js");

const networks = {
  ethereum: {
    vTokenFactory: {
      address: "0x24aD48f31CAb5E35D0E9CDfa9213b5451f22FB92",
      blockNumber: 14832754
    }
  }
};

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

  return Object.fromEntries(output
    .filter(({ output }) => output)
    .map(({ output }, index) => [vTokens[index].asset, output])
  );
};

module.exports = {
  methodology: "TVL considers tokens deposited to Phuture Indices",
  ethereum: {
    tvl: tvl("ethereum")
  }
};
