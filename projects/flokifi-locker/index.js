const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require("../helper/unwrapLPs");

const chains = {
    'ethereum': 1,
    'bsc': 56,
    'arbitrum': 42161,
    'optimism': 10,
    'polygon': 137,
    'fantom': 250,
    'avax': 43114,
    'okexchain': 66,
    'kcc': 321,
    'cronos': 25,
    'evmos': 9001,
    'dogechain': 2000
}

async function fetch(chainId) {
    const response = await getConfig('flokifi-locker', 'https://api.flokifi.com/tokens/vault-pairs-tvl?chainId=' + chainId);
    return response.tokensAndVaults;
}

function splitPairs(pairs) {
    let uniV3NFTHolders = [];
    const tokensAndOwners = [];
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (pair.isV3) uniV3NFTHolders.push(pair.vaultAddress)
        else tokensAndOwners.push([pair.tokenAddress, pair.vaultAddress]);
    }
    uniV3NFTHolders = [...new Set(uniV3NFTHolders)]; // remove duplicates
    return { tokensAndOwners, uniV3NFTHolders };
}

function tvlByChain(chain) {
    return async (_, _b, { [chain]: block }) => {
        const pairs = await fetch(chains[chain]);
        const { tokensAndOwners, uniV3NFTHolders } = splitPairs(pairs);
        const balances = await sumTokens2({ tokensAndOwners, block, chain, resolveLP: true });
        if (uniV3NFTHolders.length > 0) {
            await unwrapUniswapV3NFTs({ balances, owners: uniV3NFTHolders, chain, block });
        }
        return balances;
    };
}

Object.keys(chains).forEach(chain => {
    module.exports[chain] = {
        tvl: tvlByChain(chain)
    }
});