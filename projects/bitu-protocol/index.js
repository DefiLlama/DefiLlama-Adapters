const ADDRESSES = require("../helper/coreAssets.json");
const BITU = ADDRESSES.bsc.BITU;

module.exports = {
  bsc: {
    tvl: async (api) => {
      const supply = await api.call({ abi: "erc20:totalSupply", target: BITU });
      api.add(BITU, supply);
    },
  },
};
