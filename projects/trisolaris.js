const {calculateUsdUniTvl} = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    aurora: {
        tvl:calculateUsdUniTvl(
            "0xc66F594268041dB60507F00703b152492fb176E7", 
            "aurora", 
            "0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB", 
            [], 
            "weth", 
            18, 
            true
        ),
    },
};
// node test.js projects/trisolaris.js