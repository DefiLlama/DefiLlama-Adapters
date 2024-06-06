const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const owner = "0x7DeD7f9D3dF541190F666FB6897483e46D54e948";
const target = ADDRESSES.velas.SCAR;

async function staking(timestamp, block, chainBlocks) {
  return {
    [`bsc:${target}`]: (
      await sdk.api.erc20.balanceOf({
        target,
        owner,
        block: chainBlocks.velas,
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