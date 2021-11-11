const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x073386AE3292299a5814B00bC1ceB8f2bfC92c51) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    shiden: {
        tvl:calculateUsdUniTvl("0x073386AE3292299a5814B00bC1ceB8f2bfC92c51", "shiden", "0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef", ["0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"], "standard-protocol")
    }
}