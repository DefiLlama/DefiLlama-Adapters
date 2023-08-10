const { stakingPricedLP } = require("./helper/staking");
const { getUniTVL } = require('./helper/unknownTokens')
const factory = "0x632F04bd6c9516246c2df373032ABb14159537cd"

const corisToken = '0x2a2cd8b1f69eb9dda5d703b3498d97080c2f194f'
const masterChef = '0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://corgiswap.info/ as the source. Staking accounts for the CORIS locked in MasterChef (0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf)',
  bsc: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: stakingPricedLP(masterChef, corisToken, "bsc", "0x1881bd6aba086da0c5cfed7247f216dea50e38ed", "wbnb", true)
  },
}
