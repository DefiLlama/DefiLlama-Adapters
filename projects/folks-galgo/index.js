
const { getAssetInfo } = require("../helper/chain/algorand")

const gAlgoAssetId = 793124631
const gAlgo3Assetd = 694432641

module.exports = {
  timetravel: false,
  algorand: {
    tvl: async () => {
      const infos = await Promise.all([gAlgoAssetId, gAlgo3Assetd].map(getAssetInfo))
      let total = 0
      infos.forEach(i => total += i.circulatingSupply / (10 ** i.decimals))
      return { algorand: total }
    },
  },
};
