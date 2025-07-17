const { convertToCoinGeckoApiId, tokenMapping, mapTokens } = require("../helper/chain/provenance");
const { get } = require("../helper/http")

const paginationLimit = 1000;

const commitmentsQuery = (nextKey) =>
    `https://api.provenance.io/provenance/exchange/v1/commitments?pagination.limit=${
        paginationLimit
    }${
        nextKey ? `&pagination.key=${nextKey}` : ""
    }`;

/**
 * Tokens are committed to Provenance's Exchange Module in order to conduct
 * decentralized exchanges. This functions accumulates a an object of committed
 * denoms and the amount within the Provenance Exchange Module.
 */
const getCommittedTokens = async (acc, key) => {
    // Retrieve all the commitments across all markets
    const nextTokens = await get(commitmentsQuery(key));
    // const nextTokens = await nextTokensRequest.json()
    // Update the accumulator with each denom in the commitments
    nextTokens.commitments.map((c) =>
        c.amount.map((a) => {
            const denom = a.denom;
            if (acc[denom]) {
                acc[denom] += Number(a.amount);
            } else {
                acc[denom] = Number(a.amount);
            }
        })
    );
    let nextKey = nextTokens.pagination.next_key;
    if (nextKey) {
        // convert base64 to URL-safe pagination key. We aren't using 
        // Buffer here because base64url removes padding.
        nextKey = nextKey.replace(/\+/g, "-").replace(/\//g, "_");
        return getCommittedTokens(acc, nextKey);
    }
    return acc;
};

const tvl = async (api) => {
    const tokens = await getCommittedTokens({}, null)
    await convertToCoinGeckoApiId(tokens)
    Object.keys(tokens).map(coin => mapTokens(tokens, coin, api))
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Figure Markets TVL is calculated by the tokens committed in the Provenance Exchange module.",
    provenance: { tvl },
}