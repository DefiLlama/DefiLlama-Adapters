const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const m2m = {
  base: "0x96aa0bBe4D0dea7C4AF4739c53dBFA0300262253",
};

const assets = {
  base: ADDRESSES.base.USDC,
};

const abi = "uint256:totalNetAssets";

module.exports = {};

Object.keys(m2m).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (_, _b, cb) => {
      const block = cb[chain];
      const { output } = await sdk.api.abi.call({
        chain,
        block,
        abi,
        target: m2m[chain],
      });
      return {
        [`${chain}:${assets[chain]}`]: output,
      };
    },
  };
});
