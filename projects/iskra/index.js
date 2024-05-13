const { staking } = require("../helper/staking");

module.exports = {
  klaytn: {
    tvl: () => ({}),
    staking: staking(
      "0xb30d86d84f5b2df67ef962be0c6cf4c39901d416",
      "0x17d2628d30f8e9e966c9ba831c9b9b01ea8ea75c"
    ),
  },
};
