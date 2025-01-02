const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const farmContract = "0x3838956710bcc9D122Dd23863a0549ca8D5675D6";
const XNL_AURORA_TriLP = "0xb419ff9221039Bdca7bb92A131DD9CF7DEb9b8e5";
const XNL = "0x7cA1C28663b76CFDe424A9494555B94846205585";

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    tvl: (async) => ({}),
    staking: staking(farmContract, XNL),
    pool2: pool2(farmContract, XNL_AURORA_TriLP),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
