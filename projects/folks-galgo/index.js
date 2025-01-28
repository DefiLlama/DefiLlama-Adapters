
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

module.exports.hallmarks = [
  [1664553600, "Algorand Governance Recommitment"], //5
  [1672502400, "Algo Gov"], //6
  [1680278400, "Algo Gov"], //7
  [1688140800, "Algo Gov"], //8
  [1696089600, "Algo Gov"], //9
  [1704038400, "Algo Gov"], //10
  [1711900800, "Algo Gov"], //11
  [1719763200, "Algo Gov"], //12
  [1727712000, "Algo Gov"], //13
  [1735660800, "Algo Gov"], //14
]