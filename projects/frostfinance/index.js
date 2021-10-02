const { masterChefExports } = require('../helper/masterchef')

const STAKING_CONTRACT = "0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5";
const tundra = "0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1"

module.exports = {
  ...masterChefExports(STAKING_CONTRACT, "avax", tundra,
    ["0x317598200315f454D1B5e5cccf07c2e2c6aEE172", "0x0a081F54d81095D9F8093b5F394Ec9b0EF058876", "0xB4f4f936477E770A67587Be3EDb0581A96F8086D",
      "0xCE8d21A303b28D8ce00c0807Acfe99f9b761c880"]),
  methodology:
    "We add as tvl from the farming pools (ICICLE => LP Pairs && SNOWFLAKE => Single Tokens) through StakingContract(MasterChefV2)",
};