const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  methodology: "stTon",
  ton: {
    tvl: async () => {
      const result = await call({ target: ADDRESSES.ton.stTON, abi: "get_full_data" })
      return { "coingecko:the-open-network": result[1] / 1e9 };
    }
  }
}
