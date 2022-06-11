const { calculateUsdUniTvl } = require("./helper/getUsdUniTvl");
module.exports = {
    methodology: `Uses factory(0x34696b6cE48051048f07f4cAfa39e3381242c3eD) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    aurora: {
        tvl: calculateUsdUniTvl(
            "0x34696b6cE48051048f07f4cAfa39e3381242c3eD",
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
    }
}; // node test.js projects/amaterasu.js