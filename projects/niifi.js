const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    nahmii: {
        tvl: calculateUsdUniTvl("0xe3DcF89D0c90A877cD82283EdFA7C3Bd03e77E86", "nahmii", "0x4200000000000000000000000000000000000006",
            [
                "0x595DBA438a1bf109953F945437c1584319515d88",
                "0xBe5c622cBbF7F9c326D70f795890661FeB5BF2e6",
                "0x4F0Ea1334c97f0556d8A6e839e19770452494fDC",
                "0xd031a1682399FaD6683FF3c60De8AB5DD3B3D0A3"
            ],  "ethereum"),
    }
}; // node test.js projects/niifi.js