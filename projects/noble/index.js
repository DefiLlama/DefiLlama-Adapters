const { queryV1Beta1 } = require('../helper/chain/cosmos');
const sdk = require("@defillama/sdk");

const chain = 'noble';
const NOBLE_DENOMS_URL = 'bank/v1beta1/denoms_metadata';
const NOBLE_SUPPLY_URL = 'bank/v1beta1/supply/';

const IGNORE_DENOMS = ['ufrienzies', 'ustake'];

async function tvl(api) {
    const balances = {};

    // fetch all denom metadata
    const { metadatas } = await queryV1Beta1({ chain, url: NOBLE_DENOMS_URL });

    for (const metadata of metadatas) {
        const baseDenom = metadata.base;

        // ignore invalid denoms
        if (IGNORE_DENOMS.includes(baseDenom)) {
            continue;
        }

        // fetch supply for denom
        const { amount } = await queryV1Beta1({ chain, url: `${NOBLE_SUPPLY_URL}${baseDenom}` });

        sdk.util.sumSingleBalance(balances, baseDenom, parseInt(amount.amount), 'noble');
    }
    return balances;
}

module.exports = {
    misrepresentedTokens: false,
    methodology: "TVL is calculated by fetching the total supply of tokens on the Noble chain.",
    noble: {
        tvl,
    },
};
