const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokensExport } = require("../helper/chain/ton")
const HIGHLOAD_CONTRACT = "UQD8ucMJDu-VfMbemse1GaSefy8DUB18VxpvbnWiHQGlGMED"
const POOL_CONTRACT = "UQDzfsiEm9p5KCPA8xNiXHLX42WShhvXEwVadworVgFvCyV8"

module.exports = {
  methodology: "Counts all TON sitting in pre-bonding and high-load smart contact as the TVL. ",
  timetravel: false,
  ton: {
    tvl: sumTokensExport({
      owners: [HIGHLOAD_CONTRACT, POOL_CONTRACT],
      tokens: [ADDRESSES.ton.TON],
    })
  },
};
