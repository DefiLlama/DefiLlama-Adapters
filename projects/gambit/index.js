const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const SimpleGToken = "0x0729e806f57CE71dA4464c6B2d313E517f41560b"; // SimpleGToken
const Treasury = "0x1fb8611064a09469F808263C398623A86e7Aa883"; // Treasury

const tokens = {
    era: {
        USDC: ADDRESSES.era.USDC
    },
};

async function eraTvl(_, _b, _cb, { api }) {
    const tokensAndOwners = [
        [tokens.era.USDC, SimpleGToken],
        [tokens.era.USDC, Treasury],
    ];
    return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
    methodology: `Count the USDC that has been deposited on Gambit`,
    era: {
        tvl: eraTvl,
    },
};

