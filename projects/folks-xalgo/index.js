const { getAssetInfo } = require("../helper/chain/algorand");

const xAlgoAssetId = 1134696561;

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async (api) => {
      const info = await getAssetInfo(xAlgoAssetId);
      api.add(xAlgoAssetId+'', info.circulatingSupply)
    },
  },
};
