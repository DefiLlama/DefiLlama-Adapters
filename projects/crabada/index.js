const { staking } = require("../helper/staking");

const stakingContract = "0xD2cd7a59Aa8f8FDc68d01b1e8A95747730b927d3";
const CRA = "0xa32608e873f9ddef944b24798db69d80bbb4d1ed";

module.exports = {
  misrepresentedTokens: true,
  avax: {
    staking: staking(stakingContract, CRA),
    tvl: () =>({}),
  },
  methodology:
  "Counts liquidty of the assets(USDC) deposited through Treasury Contract; also Staking and Treasury parts",
};
