const { staking } = require("../helper/staking");

module.exports = {
  methodology: "Catecoin staking pool",
  bsc: {
    tvl: () => ({}),
    staking: staking(
      "0x2F9FbB154e6C3810f8B2D786cB863F8893E43354",
      "0xE4FAE3Faa8300810C835970b9187c268f55D998F"
    ),
  },
};
