
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
  [1665158400, "Governance 5 Recommitment"],
  [1673114400, "Governance 6 Recommitment"],
  [1680879600, "Governance 7 Recommitment"],
  [1688745600, "Governance 8 Recommitment"],
  [1696694400, "Governance 9 Recommitment"],
  [1704643200, "Governance 10 Recommitment"],
  [1712505600, "Governance 11 Recommitment"],
  [1720368000, "Governance 12 Recommitment"],
  [1728316800, "Governance 13 Recommitment"],
]