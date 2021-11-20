const {calculateUsdUniTvl} = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    aurora: {
        tvl:calculateUsdUniTvl(
            "0xc66F594268041dB60507F00703b152492fb176E7", 
            "aurora", 
            "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", 
            [
                //USDC
                "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
                //USDT
                "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
                //wNEAR
                "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d"
            ], 
            "weth", 
        ),
    },
};
// node test.js projects/trisolaris.js