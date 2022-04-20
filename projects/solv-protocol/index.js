const { sumTokens, } = require('../helper/unwrapLPs')
const axios = require('axios')
const { transformBscAddress, transformEthereumAddress, transformPolygonAddress, transformArbitrumAddress } = require("../helper/portedTokens");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json"

const ethereumTVL = async (timestamp, block, chainBlocks) => {
    const transform = await transformEthereumAddress();
    return tvl(timestamp, block, chainBlocks, "ethereum", 1, transform);
}

const polygonTVL = async (timestamp, block, chainBlocks) => {
    const transform = await transformPolygonAddress();
    return tvl(timestamp, block, chainBlocks, "polygon", 137, transform);
}

const arbitrumTVL = async (timestamp, block, chainBlocks) => {
    const transform = await transformArbitrumAddress();
    return tvl(timestamp, block, chainBlocks, "arbitrum", 42161, transform);
};

const bscTVL = async (timestamp, block, chainBlocks) => {
    const transform = await transformBscAddress();
    return tvl(timestamp, block, chainBlocks, "bsc", 56, transform);
};

async function tvl(timestamp, block, chainBlocks, network, chainId, transform) {
    let balances = {}; // Setup the balances object
    const tokens = await tokenList(chainId);
    let tokenPairs = []
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        tokenPairs.push([
            token.address,
            token.pool
        ])
    }

    await sumTokens(balances, tokenPairs, block, network, transform)

    return balances;
}

async function tokenList(chainId) {
    let tokens = [];
    const allTokens = (await axios.get(tokenListsApiEndpoint)).data.tokens;
    for (let token of allTokens) {
        if (chainId == token.chainId) {
            tokens.push({
                address: token.extensions.voucher.underlyingToken.address,
                pool: token.extensions.voucher.vestingPool
            })
        }
    }

    return tokens;
}
// node test.js projects/solv-protocol/index.js
module.exports = {
    ethereum: {
        tvl: ethereumTVL
    },
    bsc: {
        tvl: bscTVL
    },
    polygon: {
        tvl: polygonTVL
    },
    arbitrum: {
        tvl: arbitrumTVL
    }
};
