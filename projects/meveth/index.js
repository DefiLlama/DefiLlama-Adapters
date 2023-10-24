const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const ethContract = ADDRESSES.ethereum.mevETH;
const getFraction =
  "function fraction() view returns (uint128 base, uint128 elastic)";
async function eth(timestamp, ethBlock, chainBlocks) {
  const fraction = await sdk.api.abi.call({
    block: ethBlock,
    target: ethContract,
    abi: getFraction,
  });
  return {
    [ADDRESSES.null]: fraction.output.elastic,
  };
}

module.exports = {
  hallmarks: [],
  methodology:
    "Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued",
  timetravel: false,
  doublecounted: true,
  ethereum: {
    tvl: eth,
  },
};
