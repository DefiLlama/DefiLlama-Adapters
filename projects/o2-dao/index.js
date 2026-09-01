const { stakingPriceLP } = require("../helper/staking");

const transform = addr=>`avax:${addr}`
const chain = "avax"

const joeLP = "0x7bc2561d69b56fae9760df394a9fa9202c5f1f11"

const stakingToken = "0xAA2439DBAd718c9329a5893A51a708C015F76346"

module.exports={
    avax:{
        tvl: () => 0,
        staking: stakingPriceLP("0x50971d6B5a3CCd79C516f914208C67C8104977dF", stakingToken, joeLP, transform)
    }
}