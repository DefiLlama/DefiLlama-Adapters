const { sumTokens, } = require('../helper/unwrapLPs')
const axios = require('axios')
const { staking } = require('../helper/staking');
const { transformBscAddress, transformEthereumAddress, transformPolygonAddress, transformArbitrumAddress } = require("../helper/portedTokens");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json"

// Staking Tvls
const solvEthereumTokenAddress = '0x256F2d67e52fE834726D2DDCD8413654F5Eb8b53'
const solvEthereumPoolAddress = '0x7D0C93DcAD6f6B38C81431d7262CF0E48770B81a'
const solvBscTokenAddress = '0xC073c4eD65622A9423b5e5BDe2BFC8B81EBC471c'
const solvBscPoolAddress = '0xE5742912EDb4599779ACC1CE2acB6a06E01f1089'

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
            if (token.extensions.voucher.underlyingToken && token.extensions.voucher.underlyingToken.symbol != "SOLV") {
                tokens.push({
                    address: token.extensions.voucher.underlyingToken.address,
                    pool: token.extensions.voucher.vestingPool
                })
            }
        }
    }

    return tokens;
}
// node test.js projects/solv-protocol/index.js
module.exports = {
    ethereum: {
        tvl: ethereumTVL,
        staking: staking(solvEthereumPoolAddress, solvEthereumTokenAddress)
    },
    bsc: {
        tvl: bscTVL,
        staking: staking(solvBscPoolAddress, solvBscTokenAddress, "bsc")
    },
    polygon: {
        tvl: polygonTVL
    },
    arbitrum: {
        tvl: arbitrumTVL
    }
};
