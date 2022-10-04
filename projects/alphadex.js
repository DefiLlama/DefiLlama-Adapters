const { calculateUsdUniTvl } = require("./helper/getUsdUniTvl");
module.exports = {
    methodology: `Uses factory(0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    moonriver: {
        tvl: calculateUsdUniTvl(
            "0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d",
            "moonriver",
            "0x98878b06940ae243284ca214f92bb71a2b032b8a",
            [
                "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d",
                "0x1a93b23281cc1cde4c4741353f3064709a16197d"
            ],
            "moonriver"
        ),
    }
};