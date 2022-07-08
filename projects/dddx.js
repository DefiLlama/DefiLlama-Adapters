const { calculateUsdUniTvl } = require("./helper/getUsdUniTvl");
const { stakings } = require("./helper/staking");

module.exports = {
    misrepresentedTokens: true,
    doublecounted: false,
    timetravel: true,
    incentivized: true,
    bsc: {
        tvl: calculateUsdUniTvl(
            "0xb5737A06c330c22056C77a4205D16fFD1436c81b",
            "bsc",
            "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
            [
                "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
                "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"
            ],
            "binancecoin"
        ),
        staking: stakings(
            [
                '0x488f0252B4bEa5A851FE9C827894d08868D552C0',
                '0xAd8Ab2C2270Ab0603CFC674d28fd545495369f31',
                '0x37056DbB4352877C94Ef6bDbB8C314f749258fCA',

            ],
            '0x4B6ee8188d6Df169E1071a7c96929640D61f144f',
            'bsc'
        )
    }
};
