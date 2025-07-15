/**
 * Token Mapping for Provenance. Note that
 * YLDS is pending on CoinGecko, but is a stablecoin.
 * Additionally, LRWA and REIT are also 1:1 with USD
 */
const tokenMapping = {
    hash: "hash-2",
    "eth.figure.se": "ethereum",
    "usd.trading": "usd-coin",
    "usdc.figure.se": "usd-coin",
    // "ylds.fcc": "ylds",
    "usdt.figure.se": "tether",
    "xrp.figure.se": "ripple",
    "sol.figure.se": "solana",
    "btc.figure.se": "bitcoin",
    "uni.figure.se": "uniswap",
    "lrwa.figure.markets": "usd-coin",
    "link.figure.se": "chainlink",
    'reit.figure.markets': "usd-coin",
};

/**
 * Denoms are listed as their base unit. For example, HASH is returned as
 * nhash, and needs to be converted to it's CoinGecko Value.
 * We do this by querying the denom metadata and using the provided
 * exponent and base unit to convert.
 * @param tokenObject An object with key: token name (in base units) 
 * and value: amount of tokens
 * Example: {
 *   nhash: 100000000
 * }
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
            if (denomExponent && tokenMapping[denomExponent.denom]) {
                // Map these tokens to coingecko
                const key = tokenMapping[denomExponent.denom]
                if (tokenObject[key]) {
                    const incomingAmount = BigInt(tokenObject[t]) / BigInt(Math.pow(10, denomExponent.exponent))
                    const newVal = BigInt(tokenObject[key]) + incomingAmount
                    tokenObject[key] = newVal.toString();
                } else {
                    tokenObject[key] = (BigInt(tokenObject[t]) / BigInt(Math.pow(10, denomExponent.exponent))).toString();
                }
                delete tokenObject[t];
            }
        })
    );

// Map tokens. If they exist in coingecko, add to coingecko.
// Otherwise, keep in provenance
const mapTokens = (tokens, coin, api) =>  
        Object.values(tokenMapping).includes(coin) ? 
        api.addCGToken(coin, tokens[coin]) : api.add(coin, tokens[coin])

module.exports = {
    tokenMapping,
    convertToCoinGeckoApiId,
    mapTokens,
}