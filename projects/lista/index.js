const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unknownTokens");

module.exports = {
    methodology: "The TVL is calculated by summing the values of tokens held in the specified vault addresses",
   
    bsc: {
        tvl: sumTokensExport({
            tokensAndOwners: [
               
                // lista lock
                [
                    "0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46",
                    "0xd0C380D31DB43CD291E2bbE2Da2fD6dc877b87b3",
                ],
            ],
        }),
    },
};
