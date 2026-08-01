
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
  ['2022-09-30', "Algorand Governance Recommitment"], //5
  ['2022-12-31', "Algo Gov"], //6
  ['2023-03-31', "Algo Gov"], //7
  ['2023-06-30', "Algo Gov"], //8
  ['2023-09-30', "Algo Gov"], //9
  ['2023-12-31', "Algo Gov"], //10
  ['2024-03-31', "Algo Gov"], //11
  ['2024-06-30', "Algo Gov"], //12
  ['2024-09-30', "Algo Gov"], //13
  ['2024-12-31', "Algo Gov"], //14
]