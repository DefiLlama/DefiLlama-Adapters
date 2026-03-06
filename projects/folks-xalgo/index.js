const { getAssetInfo } = require("../helper/chain/algorand");
const { getCachedPrices } = require('./prices');
const { xAlgoAssetId, algoAssetId } = require('./constants');

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async () => {
      const prices = await getCachedPrices();
      const xAlgoPrice = prices[xAlgoAssetId];
      const algoPrice = prices[algoAssetId];

      const info = await getAssetInfo(xAlgoAssetId);
      const totalXAlgo = info.circulatingSupply / 10 ** info.decimals;
      const totalAlgo = totalXAlgo * xAlgoPrice / algoPrice;
      return { algorand: totalAlgo };
    },
  },
};
