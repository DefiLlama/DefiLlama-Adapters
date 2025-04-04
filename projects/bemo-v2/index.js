const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  methodology: "bmTon",
  ton: {
    tvl: async () => {
      const result = await call({ target: ADDRESSES.ton.bmTON, abi: "get_full_data" })
      return { "coingecko:the-open-network": result[1] / 1e9 };
    }
  }
}