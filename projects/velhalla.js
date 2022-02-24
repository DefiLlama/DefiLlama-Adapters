const sdk = require("@defillama/sdk");
const { getBlock } = require("./helper/getBlock");
const owner = "0x7DeD7f9D3dF541190F666FB6897483e46D54e948";
const target = "0x8d9fb713587174ee97e91866050c383b5cee6209";

async function staking(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "velas", chainBlocks);
  return {
    [`bsc:${target}`]: (
      await sdk.api.erc20.balanceOf({
        target,
        owner,
        block,
        chain: "velas",
      })
    ).output,
  };
}

module.exports = {
  velas: {
    tvl: () => ({}),
    staking,
  },
};