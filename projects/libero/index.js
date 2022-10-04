const sdk = require("@defillama/sdk");
const { getBlock } = require("../helper/getBlock");
const owner = "0xb2b11D8DA4cd9c20410de6EB55BAD2734983040E";
const target = "0x0DFCb45EAE071B3b846E220560Bbcdd958414d78";

async function staking(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "bsc", chainBlocks);
  return {
    [`bsc:${target}`]: (
      await sdk.api.erc20.balanceOf({
        target,
        owner,
        block,
        chain: "bsc",
      })
    ).output,
  };
}

module.exports = {
    bsc: {
        tvl: () => ({}),
        staking,
      },
    methodology: "We count all LIBERO deposited into LIBERO BANK, which has been locked by users in exchange for xLIBERO",
};