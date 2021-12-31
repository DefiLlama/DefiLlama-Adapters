const { toBn } = require("evm-bn");

const { TOKENS, TOKEN_SYMBOLS } = require("./tokens")

function bigNumberify(n) {
    const ONE = 1;
    if (n === "")
        return toBn("0");
    return toBn(n.toString()).div(toBn(ONE.toString()));
}

function expandDecimals(n, decimals) {
    if (n === "")
        return toBn("0");
    return toBn(n.toString(), decimals);
}

function getToken(chainId, address) {
    const CHAIN_IDS = [
        chainId
    ];

    const TOKENS_MAP = {};
    const TOKENS_BY_SYMBOL_MAP = {};

    for (let j = 0; j < CHAIN_IDS.length; j++) {
        const chainId = CHAIN_IDS[j];
        TOKENS_MAP[chainId] = {};
        TOKENS_BY_SYMBOL_MAP[chainId] = {};
        for (let i = 0; i < TOKENS[chainId].length; i++) {
            const token = TOKENS[chainId][i];
            TOKENS_MAP[chainId][token.address] = token;
            TOKENS_BY_SYMBOL_MAP[chainId][token.symbol] = token;
        }
    }

    if (!TOKENS_MAP[chainId]) {
        throw new Error(`Incorrect chainId ${chainId}`);
    }
    const tokensMap = Object.keys(TOKENS_MAP[chainId]).reduce(
        (destination, key) => {
            destination[key.toLowerCase()] = TOKENS_MAP[chainId][key];
            return destination;
        },
        {}
    );

    if (!tokensMap[address]) {
        throw new Error(`Incorrect tokenId "${address}" for chainId ${chainId}`);
    }

    return tokensMap[address];
}

function getInfoTokens(chainId, tokens, vaultTokenInfo) {
    if (!tokens) {
        return;
    }
    const tokenMap = {};
    for (let i = 0; i < tokens.length; i++) {
        let token = JSON.parse(JSON.stringify(tokens[i]));
        const tokenInfo = getToken(chainId, token.id);
        token = { ...token, ...tokenInfo };
        if (vaultTokenInfo) {
            const vaultPropsLength = 9;
            token.poolAmount = vaultTokenInfo[i * vaultPropsLength];
            token.minPrice = vaultTokenInfo[i * vaultPropsLength + 4];
            token.maxPrice = vaultTokenInfo[i * vaultPropsLength + 5];
        }

        token.availableAmount = bigNumberify(
            token.poolAmounts || bigNumberify(0)
        ).sub(bigNumberify(token.reservedAmounts || 0));
        const availableUsd = token.minPrice
            ? bigNumberify(token.availableAmount || 0)
                .mul(token.minPrice)
                .div(expandDecimals(1, token.decimals))
            : bigNumberify(0);
        token.availableUsd = availableUsd;
        token.managedUsd = availableUsd.add(token.guaranteedUsd);
        tokenMap[token.symbol] = token;
    }
    const info = [];
    for (let i = 0; i < TOKEN_SYMBOLS.length; i++) {
        const symbol = TOKEN_SYMBOLS[i];
        info.push(tokenMap[symbol]);
    }
    return { infoTokens: info.filter(Boolean), tokenMap };
}

module.exports = {
    getInfoTokens,
    expandDecimals,
    bigNumberify
}