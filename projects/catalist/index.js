const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const aceContract = "0xec46d5a0ee47e585fab59a15976d0f2413bfbb82";

async function ace(timestamp, ethBlock, { endurance: block }) {
  const chain = "ace";
  const pooledACE = await sdk.api.abi.call({
    block,
    chain,
    target: aceContract,
    abi: "uint256:getTotalPooledAce",
  });

  return {
    [ADDRESSES.null]: pooledACE.output,
  };
}

module.exports = {
  methodology:
    "Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued.",
  endurance: {
    tvl: ace,
  },
};
