const { getAssetInfo } = require("../helper/chain/algorand");

const xAlgoAssetId = 1134696561;

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async () => {
      const info = await getAssetInfo(xAlgoAssetId);
      const total = info.circulatingSupply / 10 ** info.decimals;
      return { algorand: total };
    },
  },
};
