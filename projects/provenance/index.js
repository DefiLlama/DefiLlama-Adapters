const { get } = require("../helper/http")

const coingeckoMapping = {
    hash: "hash-2",
    "eth.figure.se": "ethereum",
    "usd.trading": "usd-coin",
    "usdc.figure.se": "usd-coin",
    // Note: YLDS is 1:1, but pending in CoinGecko
    "ylds.fcc": "usd-coin",
    "usdt.figure.se": "tether",
    "xrp.figure.se": "ripple",
    "sol.figure.se": "solana",
    "btc.figure.se": "bitcoin",
    "uni.figure.se": "uniswap",
    // "lrwa.figure.markets": "usd-coin",
    "link.figure.se": "chainlink",
    // 'reit.figure.markets': "usd-coin",
};

const paginationLimit = 1000;

const listOfCommitments = (nextKey) =>
    `https://api.provenance.io/provenance/exchange/v1/commitments?pagination.limit=${
        paginationLimit
    }${
        nextKey ? `&pagination.key=${nextKey}` : ""
    }`;

// Retrieve all commitments using a tail recursive function
const getTokens = async (acc, key) => {
    // Retrieve all the commitments across all markets
    const nextTokens = await get(listOfCommitments(key));
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
        return getTokens(acc, nextKey);
    }
    return acc;
};

/**
 * Function to pull the denom exponent, convert to base units,
 * and map to coingecko API IDs
 */
const convertToCoinGeckoApiId = async (tokenObject) =>
    await Promise.all(
        Object.keys(tokenObject).map(async (t) => {
            // Get the denom exponent information
            const response = await fetch(
                `https://api.provenance.io/cosmos/bank/v1beta1/denoms_metadata/${t}`
            );
            const denomExponent = (await response.json()).metadata?.denom_units[1]
            // If a denom is present and we have mapped the token to the CoinGecko Equivalent...
            if (denomExponent && coingeckoMapping[denomExponent.denom]) {
                // If it already exists, increment it
                if (tokenObject[coingeckoMapping[denomExponent.denom]]) {
                    tokenObject[coingeckoMapping[denomExponent.denom]] += tokenObject[t] * Math.pow(10, -denomExponent.exponent);
                } else {
                    tokenObject[coingeckoMapping[denomExponent.denom]] = tokenObject[t] * Math.pow(10, -denomExponent.exponent);
                }
                delete tokenObject[t];
            }
        })
    );

const tvl = async (api) => {
    const tokens = await getTokens({}, null)
    await convertToCoinGeckoApiId(tokens)
    Object.keys(tokens).map(coin => api.addCGToken(coin, tokens[coin]))
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Provenance TVL is calculated by the tokens committed in the exchange module.",
    provenance: { tvl }
}