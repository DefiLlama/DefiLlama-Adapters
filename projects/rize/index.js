const ADDRESSES = require("../helper/coreAssets.json");
const target = "0x02d88035861f4d6e1b3b7a0f74771fe14ce31d7c";
const sdk = require("@defillama/sdk");

async function eth(timestamp, ethBlock, chainBlocks) {
  const pooledETH = await sdk.api.abi.call({
    block: ethBlock,
    target: target,
    abi: "uint256:getTotalPooledEther",
  });

  return {
    [ADDRESSES.ethereum.ETH]: pooledETH.output,
  };
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: eth,
  },
};
