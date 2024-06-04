const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens')

const swapMiningStakingContract = "0xC31A355277228C1bf9A88599647faEaaE664Ea1f";
const X = "0xAe28714390e95B8dF1Ef847C58AEaC23ED457702";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(swapMiningStakingContract, X),
    tvl: getUniTVL({ factory: '0x97bCD9BB482144291D77ee53bFa99317A82066E8', useDefaultCoreAssets: true }),
  },
  methodology:
    "Factory address on BSC (0x97bCD9BB482144291D77ee53bFa99317A82066E8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};
