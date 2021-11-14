const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x073386AE3292299a5814B00bC1ceB8f2bfC92c51) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    shiden: {
        tvl:calculateUsdUniTvl(
            "0x073386AE3292299a5814B00bC1ceB8f2bfC92c51", 
            "shiden", 
            "0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef", 
            [
            // USDC
            "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
            // USDT
            "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
            // JPYC
            "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F",
            // STND
            "0x722377A047e89CA735f09Eb7CccAb780943c4CB4"
            ], "shiden")
    }
}