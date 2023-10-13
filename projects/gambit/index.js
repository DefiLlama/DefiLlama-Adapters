const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const SimpleGToken = "0x0729e806f57CE71dA4464c6B2d313E517f41560b"; // SimpleGToken
const Treasury = "0x1fb8611064a09469F808263C398623A86e7Aa883"; // Treasury

module.exports = {
    methodology: `Count the USDC that has been deposited on Gambit`,
    era: {
        tvl: sumTokensExport({ owners: [SimpleGToken, Treasury], tokens: [ADDRESSES.era.USDC], }),
    },
};

