const { staking } = require("../helper/staking");

const empyreanStaking = "0xD080CBc2885c64510923Ac6F5c8896011f86a6aF";
const EMPYR = "0xE9F226a228Eb58d408FdB94c3ED5A18AF6968fE1";

module.exports = {
  misrepresentedTokens: true,
  aurora: {
    staking: staking(empyreanStaking, EMPYR),
    tvl: () => ({}),
  },
  methodology:
    "Counts USDC and TLP (EMPYR-USDC) on the treasury",
};


module.exports.deadFrom = '2022-05-09'