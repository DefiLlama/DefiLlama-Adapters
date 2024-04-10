const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
    ethereum: {
        tvl: sumTokensExport({
            owners: ["0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774"],
            tokens: [
                nullAddress,
                "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
                "0x49446A0874197839D15395B908328a74ccc96Bc0",
                "0xE46a5E19B19711332e33F33c2DB3eA143e86Bc10",
                "0x49446A0874197839D15395B908328a74ccc96Bc0",
                "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
                "0xf951E335afb289353dc249e82926178EaC7DEd78",
                "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
                "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
                "0x8a053350ca5F9352a16deD26ab333e2D251DAd7c",
                "0x8457CA5040ad67fdebbCC8EdCE889A335Bc0fbFB",
                "0x5cb12D56F5346a016DBBA8CA90635d82e6D1bcEa",
                "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
                "0x7122985656e38BDC0302Db86685bb972b145bD3C"
            ]
        })
    }
}
