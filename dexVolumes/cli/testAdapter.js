const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
const { volume } = require("../pancakeswap");

const test = async () => {
  const { timestamp, chainBlocks } = await getCurrentBlocks();
  console.log(chainBlocks, "chainBlocks");
  volume.bsc.fetch(timestamp).then((res) => {
    console.log(res);
  });
};

test();
