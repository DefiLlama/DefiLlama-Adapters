const { getUniTVL } = require("./helper/unknownTokens");
const { stakings } = require("./helper/staking");

module.exports = {
    misrepresentedTokens: true,
    bsc: {
        tvl: getUniTVL({ factory: '0xb5737A06c330c22056C77a4205D16fFD1436c81b', useDefaultCoreAssets: true }),
        staking: stakings(
            [
                '0x488f0252B4bEa5A851FE9C827894d08868D552C0',
                '0xAd8Ab2C2270Ab0603CFC674d28fd545495369f31',
                '0x37056DbB4352877C94Ef6bDbB8C314f749258fCA',

            ],
            '0x4B6ee8188d6Df169E1071a7c96929640D61f144f',
        )
    }
};
