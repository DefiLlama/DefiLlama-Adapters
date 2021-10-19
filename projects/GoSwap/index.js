const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xe93c2cD333902d8dd65bF9420B68fC7B1be94bB3) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    gochain: {
        tvl:calculateUsdUniTvl("0xe93c2cD333902d8dd65bF9420B68fC7B1be94bB3", "gochain", "0xcC237fa0A4B80bA47992d102352572Db7b96A6B5", ["0x97a19aD887262d7Eca45515814cdeF75AcC4f713", "0xe8D71132Cd78146fbeD8c085f6c06CdeDF74E3Be","0x67bBB47f6942486184f08a671155FCFA6cAd8d71",
                                "0x331357dDD79F4E8da3f972E4Af30a8B726790a56", "0x5347FDeA6AA4d7770B31734408Da6d34a8a07BdF"], "gochain")
    }
}