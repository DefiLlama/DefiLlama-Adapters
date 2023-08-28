const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const SimpleGToken = "0x0729e806f57CE71dA4464c6B2d313E517f41560b"; // SimpleGToken

module.exports = {
    methodology: `Count the USDC that has been deposited on Gambit`,
    era: {
        tvl: sumTokensExport({ owner: SimpleGToken, tokens: [ADDRESSES.era.USDC], }),
    },
};

