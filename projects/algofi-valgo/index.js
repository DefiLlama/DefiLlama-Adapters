
const { getAppGlobalState } = require("../helper/chain/algorand")

const vAlgoAssetId = 465814318
const vAlgo2Assetd = 879935316

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async () => {
      const states = await Promise.all([vAlgoAssetId, vAlgo2Assetd].map(getAppGlobalState))
      let total = 0
      states.forEach(i => total += (i.acc || i.ac) / 1e6)
      return { algorand: total }
    },
  },
};
