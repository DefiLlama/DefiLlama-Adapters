const {calculateUsdUniTvl} = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    aurora: {
        tvl:calculateUsdUniTvl(
            // factory
            "0x7928D4FeA7b2c90C732c10aFF59cf403f0C38246",
            // chain
            "aurora",
            // coreAssetRaw
            "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB",
            [ // whitelistRaw
                // USDC
                "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
                // USDT
                "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
                // DAI
                "0xe3520349F477A5F6EB06107066048508498A291b",
                // wNEAR
                "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d",
                // AURORA
                "0x8BEc47865aDe3B172A928df8f990Bc7f2A3b9f79"
            ],
            // coreAssetName
            "weth", 
        ),
    },
};