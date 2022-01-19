const { calculateUsdUniTvl } = require("./helper/getUsdUniTvl");
module.exports = {
    methodology: `Uses factory(0xF9678db1CE83f6f51E5df348E2Cc842Ca51EfEc1) address and whitelisted tokens to find and price Liquidity Pool pairs`,
    misrepresentedTokens: true,
    doublecounting: false,
    timeTravel: true,
    incentivized: true,
    telos: {
        tvl: calculateUsdUniTvl(
            "0xF9678db1CE83f6f51E5df348E2Cc842Ca51EfEc1",
            "telos",
            "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E",
            [
                "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b",
            ],
            "telos"
        ),
    }
}; // node test.js projects/omnidex.js