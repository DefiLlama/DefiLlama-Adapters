const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

const aETHContractAddress = "0xFC87753Df5Ef5C368b5FBA8D4C5043b77e8C5b39";


module.exports = {
  ethereum: {
    tvl: async (_, _1, _2) => {
      const totalSupply = await sdk.api.abi.call({
        target: aETHContractAddress,
        abi: "uint256:totalSupply"
      });

      return {
        [ADDRESSES.null]: totalSupply.output
      };
    }
  }
};
