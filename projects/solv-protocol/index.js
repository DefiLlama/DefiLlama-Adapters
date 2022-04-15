const sdk = require('@defillama/sdk');
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
    console.log(tokens)
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenBal = sdk.api.erc20.balanceOf({
            target: token.address,
            owner: token.pool,
            chain: network,
            block: chainBlocks[network],
        }); // Pool's token balance

        sdk.util.sumSingleBalance(balances, transform(token.address), (await tokenBal).output)
    }

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
