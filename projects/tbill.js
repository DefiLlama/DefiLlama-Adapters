const sdk = require("@defillama/sdk");
const { getBlock } = require("./helper/getBlock");

async function tvl(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "theta", chainBlocks);
  return {
    "theta-fuel": (
      await sdk.api.eth.getBalance({
        target: "0x4dc08b15ea0e10b96c41aec22fab934ba15c983e",
        block,
        chain: "theta",
        decimals: 18,
      })
    ).output,
  };
};

module.exports = {
  theta: {
    tvl,
  },
};
