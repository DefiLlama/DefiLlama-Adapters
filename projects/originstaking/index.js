const { staking } = require("../helper/staking");

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking(
      "0x63898b3b6Ef3d39332082178656E9862bee45C57",
      "0x8207c1FfC5B6804F6024322CcF34F29c3541Ae26",
    ),
  },
};
