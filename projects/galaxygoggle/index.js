const { staking } = require("../helper/staking");

const GgStaking = "0xBD79c01140CeE7040f8F5E935B72e13540a801b6"
const gg = "0xF2F7CE610a091B94d41D69f4fF1129434a82E2f0"

const bscGG = "0xcAf23964Ca8db16D816eB314a56789F58fE0e10e";
const bscStaking = "0x97209Cf7a6FccC388eEfF85b35D858756f31690d";

module.exports = {
  avax:{
    tvl: () => 0,
    staking: staking(GgStaking, gg)
  },
  bsc: {
    tvl: () => 0,
    staking: staking(bscStaking, bscGG, "bsc", `avax:${gg}`)
  },
  deadFrom: "2022-01-11",
  methodology:
    "Counts tokens on the treasury for tvl and staked GG for staking",
};
