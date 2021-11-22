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
            ], "shiden"),
    },
    ethereum: {
        tvl:calculateUsdUniTvl(
            "0x53AC1d1FA4F9F6c604B8B198cE29A50d28cbA893", 
            "ethereum", 
            "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 
            [
            // USDC
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            // STND
            "0x9040e237c3bf18347bb00957dc22167d0f2b999d",
            ], "weth"),
    },
}