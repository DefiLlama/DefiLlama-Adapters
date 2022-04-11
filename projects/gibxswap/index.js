const { staking } = require("../helper/staking");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const swapMiningStakingContract = "0xC31A355277228C1bf9A88599647faEaaE664Ea1f";
const X = "0xAe28714390e95B8dF1Ef847C58AEaC23ED457702";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(swapMiningStakingContract, X, "bsc"),
    tvl: calculateUsdUniTvl(
      "0x97bCD9BB482144291D77ee53bFa99317A82066E8",
      "bsc",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      ["0x55d398326f99059fF775485246999027B3197955"],
      "WBNB"
    ),
  },
  methodology:
    "Factory address on BSC (0x97bCD9BB482144291D77ee53bFa99317A82066E8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
