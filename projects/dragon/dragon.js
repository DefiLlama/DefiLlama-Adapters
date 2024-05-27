const { stakingPricedLP } = require("./helper/staking");

const dragonToken = '0x528757e34a5617aa3aabe0593225fe33669e921c'
const masterChef = '0xbb595f34190c6ea1add1c78f6d12df181542763c'

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://corgiswap.info/ as the source. Staking accounts for the CORIS locked in MasterChef (0x60E5Cf9111d046E8F986fC98e37d6703607d5Baf)',
  base: {
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
    staking: stakingPricedLP(masterChef, dragonToken, "base", "0xD53881CAee96D3A94Fd0e2Eb027a05fD44d8c470", "weth", true)
  },
}
