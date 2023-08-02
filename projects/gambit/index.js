const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const SimpleGToken = "0x0729e806f57CE71dA4464c6B2d313E517f41560b"; // SimpleGToken

const tokens = {
    era: {
        USDC: ADDRESSES.era.USDC
    },
};

async function eraTvl(_, _b, _cb, { api }) {
    // timestamp, block, chainBlocks, chainApi
    const tokensAndOwners = [
        [tokens.era.USDC, SimpleGToken],
    ];
    return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
    methodology: `Count the USDC that has been deposited on Gambit`,
    era: {
        // staking: staking('contract', tokens.era.CNG),
        tvl: eraTvl,
    },
};

