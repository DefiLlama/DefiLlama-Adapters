const { masterChefExports } = require('../helper/masterchef')

const STAKING_CONTRACT = "0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5";
const tundra = "0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1"

module.exports = {
  ...masterChefExports(STAKING_CONTRACT, "avax", tundra),
  methodology:
    "We add as tvl from the farming pools (ICICLE => LP Pairs && SNOWFLAKE => Single Tokens) through StakingContract(MasterChefV2)",
};